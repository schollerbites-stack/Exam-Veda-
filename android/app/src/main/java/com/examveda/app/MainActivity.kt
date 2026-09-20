package com.examveda.app

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var layoutOffline: View
    private lateinit var btnRetry: Button

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var backPressedTime: Long = 0

    // File Chooser launcher for file uploads (e.g. uploading question papers/JSON)
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (filePathCallback != null) {
            val results: Array<Uri>? = if (result.resultCode == RESULT_OK) {
                val data = result.data
                if (data?.clipData != null) {
                    val count = data.clipData!!.itemCount
                    Array(count) { i -> data.clipData!!.getItemAt(i).uri }
                } else if (data?.data != null) {
                    arrayOf(data.data!!)
                } else {
                    null
                }
            } else {
                null
            }
            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Bind Views
        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        progressBar = findViewById(R.id.progressBar)
        layoutOffline = findViewById(R.id.layoutOffline)
        btnRetry = findViewById(R.id.btnRetry)

        // Setup Swipe Refresh (Pull to reload)
        swipeRefreshLayout.setColorSchemeResources(R.color.accent, R.color.primary)
        swipeRefreshLayout.setOnRefreshListener {
            if (isNetworkAvailable()) {
                hideOfflineScreen()
                webView.reload()
            } else {
                swipeRefreshLayout.isRefreshing = false
                showOfflineScreen()
            }
        }

        // Setup Retry Button
        btnRetry.setOnClickListener {
            if (isNetworkAvailable()) {
                hideOfflineScreen()
                val targetUrl = getString(R.string.web_url)
                webView.loadUrl(targetUrl)
            } else {
                Toast.makeText(this, getString(R.string.error_offline_title), Toast.LENGTH_SHORT).show()
            }
        }

        // Setup WebView settings and clients
        setupWebView()

        // Handle Android Back Navigation
        setupBackNavigation()

        // Load the Edu Veda Web App
        val targetUrl = getString(R.string.web_url)
        if (savedInstanceState == null) {
            if (isNetworkAvailable()) {
                webView.loadUrl(targetUrl)
            } else {
                showOfflineScreen()
            }
        } else {
            webView.restoreState(savedInstanceState)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.setSupportZoom(true)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.mediaPlaybackRequiresUserGesture = false

        // Cache mode for fast local response
        settings.cacheMode = if (isNetworkAvailable()) {
            WebSettings.LOAD_DEFAULT
        } else {
            WebSettings.LOAD_CACHE_ELSE_NETWORK
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        // Custom User-Agent identifier
        val defaultUa = settings.userAgentString
        settings.userAgentString = "$defaultUa ExamVedaApp/1.0"

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
                hideOfflineScreen()
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefreshLayout.isRefreshing = false
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                // Only trigger full offline screen if main frame fails to load
                if (request?.isForMainFrame == true) {
                    if (!isNetworkAvailable()) {
                        showOfflineScreen()
                    }
                }
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false

                // Open external app schemes outside WebView
                if (url.startsWith("tel:") ||
                    url.startsWith("mailto:") ||
                    url.startsWith("whatsapp:") ||
                    url.startsWith("sms:") ||
                    url.startsWith("intent:")
                ) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    } catch (e: ActivityNotFoundException) {
                        return true
                    }
                }

                // Normal web navigation stays seamlessly inside standalone WebView
                return false
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                progressBar.progress = newProgress
                if (newProgress >= 100) {
                    progressBar.visibility = View.GONE
                }
            }

            override fun onShowFileChooser(
                view: WebView?,
                filePath: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                filePathCallback?.onReceiveValue(null)
                filePathCallback = filePath

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                try {
                    fileChooserLauncher.launch(intent)
                } catch (e: ActivityNotFoundException) {
                    filePathCallback = null
                    return false
                }
                return true
            }
        }
    }

    /**
     * Handle Android Back Navigation:
     * - If WebView has historical steps (e.g., Quiz -> Lessons -> Categories), step back in WebView.
     * - If at the root/home view, prompt double-tap to cleanly exit.
     */
    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (layoutOffline.visibility == View.VISIBLE) {
                    finish()
                    return
                }

                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    // Double back tap to exit app
                    if (backPressedTime + 2000 > System.currentTimeMillis()) {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    } else {
                        Toast.makeText(
                            this@MainActivity,
                            getString(R.string.exit_confirm_msg),
                            Toast.LENGTH_SHORT
                        ).show()
                        backPressedTime = System.currentTimeMillis()
                    }
                }
            }
        })
    }

    private fun showOfflineScreen() {
        layoutOffline.visibility = View.VISIBLE
        webView.visibility = View.GONE
        swipeRefreshLayout.isRefreshing = false
        progressBar.visibility = View.GONE
    }

    private fun hideOfflineScreen() {
        layoutOffline.visibility = View.GONE
        webView.visibility = View.VISIBLE
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager =
            getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork ?: return false
            val capabilities =
                connectivityManager.getNetworkCapabilities(network) ?: return false
            return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        } else {
            @Suppress("DEPRECATION")
            val networkInfo = connectivityManager.activeNetworkInfo ?: return false
            @Suppress("DEPRECATION")
            return networkInfo.isConnected
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }
}
