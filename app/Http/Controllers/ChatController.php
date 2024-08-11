<?php

namespace App\Http\Controllers;

use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatController extends Controller
{
    protected $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
        $this->aiService->createAssistant("E-shop Assistant", "You are an assistant helping customers with their purchases.");
        $this->aiService->createThread(); // Create a thread at the initialization.
    }

    public function index()
    {
        return view('chat.index');
    }

    public function sendMessage(Request $request)
    {
        $message = $request->input('message');
        $this->aiService->addMessageToThread($message);
        $response = $this->aiService->runAssistant();

        Log::info('Controller response: ' . $response);

        return response()->json(['response' => $response]);
    }

    public function streamMessage(Request $request)
    {
        $message = $request->input('message');
        $context = $request->input('context', []);
        Log::info('Streaming message: ' . $message);
        Log::info('Context: ', $context);

        return new StreamedResponse(function () use ($message, $context) {
            foreach ($context as $msg) {
                $this->aiService->addMessageToThread($msg['content'], $msg['role']);
            }
            $this->aiService->addMessageToThread($message);
            $stream = $this->aiService->runAssistant();

            $dataBuffer = '';
            while (!$stream->eof()) {
                $dataBuffer .= $stream->read(8192);

                while (($pos = strpos($dataBuffer, "\n\n")) !== false) {
                    $line = substr($dataBuffer, 0, $pos);
                    $dataBuffer = substr($dataBuffer, $pos + 2);

                    if (strpos($line, 'data: ') === 0) {
                        $data = trim(substr($line, 6));
                        echo "data: " . $data . "\n\n";
                        ob_flush();
                        flush();
                    }
                }
            }

        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
