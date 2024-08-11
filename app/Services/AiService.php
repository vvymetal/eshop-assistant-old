<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    protected $client;
    protected $apiKey;
    protected $baseUrl;
    protected $assistantId;
    protected $threadId;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
        $this->baseUrl = 'https://api.openai.com/v1';
        $this->client = Http::withToken($this->apiKey)
                            ->withHeaders(['OpenAI-Beta' => 'assistants=v2']);
    }

    public function createAssistant($name, $instructions, $model = 'gpt-4')
    {
        $response = $this->client->post("{$this->baseUrl}/beta/assistants", [
            'name' => $name,
            'instructions' => $instructions,
            'model' => $model,
        ]);

        $data = $response->json();
        $this->assistantId = $data['id'] ?? null;
        return $data;
    }

    public function createThread()
    {
        $response = $this->client->post("{$this->baseUrl}/beta/threads");
        $data = $response->json();
        $this->threadId = $data['id'] ?? null;
        return $data;
    }

    public function addMessageToThread($message, $role = 'user')
    {
        $response = $this->client->post("{$this->baseUrl}/beta/threads/{$this->threadId}/messages", [
            'role' => $role,
            'content' => $message,
        ]);

        return $response->json();
    }

    public function runAssistant()
    {
        try {
            Log::info('Starting runAssistant function');
            $response = $this->client->post("{$this->baseUrl}/beta/threads/{$this->threadId}/runs", [
                'assistant_id' => $this->assistantId,
            ]);

            Log::info('Assistant response: ' . $response->body());

            return $response->getBody();
        } catch (\Exception $e) {
            Log::error('API error: ' . $e->getMessage());
            throw $e;
        }
    }
}
