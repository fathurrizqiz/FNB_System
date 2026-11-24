<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use App\Models\VoucherCampaign;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'voucher_campaign_id' => ['required', 'integer', 'exists:voucher_campaigns,id'],
            'whatsapp_number' => ['required', 'string', 'max:20', 'regex:/^(?=.*\\d)[0-9+()\\s-]{8,20}$/'],
        ], [
            'whatsapp_number.regex' => 'Masukkan nomor WhatsApp yang valid.',
        ]);

        $phone = Voucher::normalizePhone($validated['whatsapp_number']);
        $token = Str::random(64);

        DB::transaction(function () use ($validated, $phone, $token): void {
            $campaign = VoucherCampaign::query()
                ->whereKey($validated['voucher_campaign_id'])
                ->lockForUpdate()
                ->first();

            if (! $campaign || ! $campaign->is_active) {
                throw ValidationException::withMessages([
                    'voucher_campaign_id' => 'Promo ini sudah tidak aktif.',
                ]);
            }

            if ($campaign->vouchers()->where('customer_phone', $phone)->exists()) {
                throw ValidationException::withMessages([
                    'whatsapp_number' => 'Nomor WhatsApp ini sudah pernah memperoleh voucher untuk promo tersebut.',
                ]);
            }

            $campaign->vouchers()->create([
                'customer_phone' => $phone,
                'token_hash' => hash('sha256', $token),
            ]);
        });

        return redirect()->route('vouchers.show', ['token' => $token]);
    }

    public function show(string $token): Response
    {
        abort_unless(strlen($token) === 64, 404);

        $voucher = Voucher::query()
            ->with('campaign')
            ->where('token_hash', hash('sha256', $token))
            ->firstOrFail();

        $status = $voucher->status;
        $qrCode = null;

        if ($status === 'issued' && $voucher->campaign->is_active) {
            $url = route('vouchers.show', ['token' => $token]);
            $renderer = new ImageRenderer(new RendererStyle(320, 2), new SvgImageBackEnd);
            $qrSvg = (new Writer($renderer))->writeString($url);
            $qrCode = 'data:image/svg+xml;base64,'.base64_encode($qrSvg);
        } elseif ($status === 'issued') {
            $status = 'inactive';
        }

        return Inertia::render('Voucher/show', [
            'token' => $token,
            'status' => $status,
            'qrCode' => $qrCode,
            'campaign' => [
                'name' => $voucher->campaign->name,
                'discount_type' => $voucher->campaign->discount_type,
                'discount_value' => $voucher->campaign->discount_value,
                'min_items' => $voucher->campaign->min_items,
            ],
        ]);
    }
}
