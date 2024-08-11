<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>AI Chat Assistant</title>
    <!-- CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        #chat-messages {
            height: 400px;
            overflow-y: auto;
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 20px;
        }
        .user-message {
            background-color: #f0f0f0;
            padding: 5px 10px;
            margin-bottom: 10px;
            border-radius: 10px;
        }
        .assistant-message {
            background-color: #e6f3ff;
            padding: 5px 10px;
            margin-bottom: 10px;
            border-radius: 10px;
        }
        .error-message {
            color: red;
        }
        .loading {
            animation: pulse 1s infinite;
        }
        @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
        }
    </style>
    @vite(['resources/css/app.css'])
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div class="container">
            <a class="navbar-brand" href="/">AI Chat Assistant</a>
        </div>
    </nav>

    <main class="container">
        @yield('content')
    </main>

    <!-- JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    @yield('scripts')
</body>
</html>
