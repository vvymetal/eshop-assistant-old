@extends('layouts.app')
@viteReactRefresh
@section('content')
    <h1>Vítejte na naší stránce ---VV</h1>
    <div id="chat-widget-container"></div> <!-- Kontejner pro chat widget -->
@endsection

@section('scripts')
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
@endsection
