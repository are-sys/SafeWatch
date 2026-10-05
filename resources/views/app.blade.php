<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
    <meta name="theme-color" content="#0891b2">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- PWA Manifest & iOS Meta Tags -->
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/images/logo.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="SafeWatch">
    
    <title>SafeWatch — Monitoreo Médico Inteligente</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body className="bg-[#EAEAEA] antialiased">
    <div id="root"></div>
</body>
</html>
