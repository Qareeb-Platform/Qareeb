# System Settings Integration Test Cases

## 1) Approve request with WhatsApp disabled
- Set `WHAPI_ENABLED=false` in Admin Settings.
- Approve one Imam/Halaqa/Maintenance request.
- Expected: status becomes `approved` and no crash happens.

## 2) Enable WhatsApp and send message
- Set `WHAPI_ENABLED=true`.
- Set `WHAPI_BASE_URL` to `https://gate.whapi.cloud`.
- Set valid `WHAPI_TOKEN`.
- Approve request that has WhatsApp number.
- Expected: request is approved and Whapi receives `POST /messages/text`.

## 3) Change token without redeploy
- Save a new `WHAPI_TOKEN` from dashboard.
- Approve another request.
- Expected: next approval uses new token immediately.

## 4) Change Cloudinary config without redeploy
- Save new `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Trigger upload signature endpoint (`POST /media/sign`).
- Expected: returned `cloud_name` / `api_key` match latest settings and upload works.
