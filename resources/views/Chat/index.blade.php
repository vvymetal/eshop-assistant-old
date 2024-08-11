<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Chat Assistant</title>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body>
    <div id="chat-container">
        <div id="chat-messages"></div>
        <form id="chat-form">
            @csrf
            <input type="text" id="user-input" required>
            <button type="submit">Odeslat</button>
        </form>
    </div>

    <script>
       @extends('layouts.app')

       @section('scripts')
<script>
let eventSource;
let assistantResponse = '';

document.getElementById('chat-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const userInput = document.getElementById('user-input').value;
    const chatMessages = document.getElementById('chat-messages');

    // Přidání uživatelské zprávy
    chatMessages.innerHTML += `<p class="user-message"><strong>Vy:</strong> ${escapeHtml(userInput)}</p>`;

    // Přidání indikátoru načítání
    let assistantMessageElement = document.createElement('p');
    assistantMessageElement.classList.add('assistant-message');
    assistantMessageElement.innerHTML = '<strong>Asistent:</strong> <span class="loading">Přemýšlím...</span>';
    chatMessages.appendChild(assistantMessageElement);

    // Zavření předchozího EventSource, pokud existuje
    if (eventSource) {
        eventSource.close();
    }

    assistantResponse = '';
    // Vytvoření nového EventSource pro streamování
    eventSource = new EventSource(`/chat/stream?message=${encodeURIComponent(userInput)}`);

    eventSource.onmessage = function(event) {
        // Přidání nového textového úseku k odpovědi asistenta
        assistantResponse += event.data;
        assistantMessageElement.innerHTML = `<strong>Asistent:</strong> ${escapeHtml(assistantResponse)}`;

        // Automatické posunutí k spodní části zpráv
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    eventSource.onerror = function(e) {
        eventSource.close();
        console.error('EventSource failed:', e);
        if (assistantResponse.trim() === "") {
            assistantMessageElement.innerHTML = '<strong>Asistent:</strong> <span class="error-message">Omlouváme se, došlo k chybě při komunikaci s asistentem.</span>';
        }
    };

    document.getElementById('user-input').value = '';
});

// Funkce pro escapování HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
</script>
@endsection

</body>
</html>
