# =====================================================
# OWNIVERSE - KIEM TRA TU DONG API (Tai khoan + Nghe si + Quan tri)
#
# Cach chay (mo terminal MOI, backend van dang chay o terminal cu):
#   powershell -ExecutionPolicy Bypass -File .\test-api.ps1
#
# Dong [PASS] mau xanh = dat, dong [FAIL] mau do = loi.
# =====================================================

$base = "http://localhost:3000"
$script:pass = 0
$script:fail = 0

function Invoke-Api {
    param([string]$Method, [string]$Path, $Body = $null, [string]$Token = "")

    $params = @{
        Uri             = "$base$Path"
        Method          = $Method
        UseBasicParsing = $true
        Headers         = @{}
    }
    if ($Token) { $params.Headers["Authorization"] = "Bearer $Token" }
    if ($null -ne $Body) {
        $json = $Body | ConvertTo-Json -Depth 10
        $params.Body = [System.Text.Encoding]::UTF8.GetBytes($json)
        $params.ContentType = "application/json; charset=utf-8"
    }

    $status = 0
    $content = ""
    try {
        $r = Invoke-WebRequest @params
        $status = [int]$r.StatusCode
        $content = $r.Content
    }
    catch {
        $resp = $_.Exception.Response
        if ($null -eq $resp) {
            Write-Host "KHONG KET NOI DUOC toi $base . Hay chay backend (dotnet run) truoc." -ForegroundColor Red
            exit 1
        }
        $status = [int]$resp.StatusCode
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            $content = $_.ErrorDetails.Message
        }
        else {
            try {
                $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
                $content = $reader.ReadToEnd()
            }
            catch { }
        }
    }

    $data = $null
    if ($content) {
        try { $data = $content | ConvertFrom-Json } catch { }
    }
    return [pscustomobject]@{ Status = $status; Data = $data }
}

function Check {
    param([string]$Name, [bool]$Ok)
    if ($Ok) {
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        $script:pass++
    }
    else {
        Write-Host "  [FAIL] $Name" -ForegroundColor Red
        $script:fail++
    }
}

$rand = Get-Random -Minimum 1000 -Maximum 99999
$email = "test$rand@gmail.com"

# =====================================================
Write-Host ""
Write-Host "=== TAI KHOAN ===" -ForegroundColor Cyan
# =====================================================

$r = Invoke-Api POST "/api/auth/login" @{ email = "customer@owniverse.com"; password = "sai-mat-khau" }
Check "Dang nhap sai mat khau -> 401" ($r.Status -eq 401)

$r = Invoke-Api POST "/api/auth/login" @{ email = "customer@owniverse.com"; password = "Customer123" }
Check "Dang nhap tai khoan demo -> 200 va co token" ($r.Status -eq 200 -and [bool]$r.Data.token)
$demoToken = $r.Data.token

$r = Invoke-Api GET "/api/users/me"
Check "Xem ho so khi chua dang nhap -> 401" ($r.Status -eq 401)

$r = Invoke-Api GET "/api/users/me" -Token $demoToken
Check "Xem ho so khi da dang nhap -> 200, dung email" ($r.Status -eq 200 -and $r.Data.email -eq "customer@owniverse.com")
Check "Ho so khong tra ve mat khau" ($null -eq $r.Data.password)

$r = Invoke-Api POST "/api/auth/register" @{ fullName = "Nguyen Test"; email = $email; phone = "0912345678"; password = "matkhau123" }
Check "Dang ky tai khoan moi -> 201" ($r.Status -eq 201)

$r = Invoke-Api POST "/api/auth/register" @{ fullName = "Nguyen Test"; email = $email; phone = "0912345678"; password = "matkhau123" }
Check "Dang ky trung email -> 409" ($r.Status -eq 409)

$r = Invoke-Api POST "/api/auth/register" @{ fullName = ""; email = "a@b.com"; password = "" }
Check "Dang ky thieu thong tin -> 400" ($r.Status -eq 400)

$r = Invoke-Api POST "/api/auth/login" @{ email = $email; password = "matkhau123" }
Check "Dang nhap bang tai khoan vua dang ky -> 200" ($r.Status -eq 200 -and [bool]$r.Data.token)
Check "Tai khoan moi co vai tro customer" ($r.Data.user.role -eq "customer")
Check "So dien thoai luc dang ky duoc luu" ($r.Data.user.phone -eq "0912345678")
$token = $r.Data.token

$r = Invoke-Api PUT "/api/users/me" @{ fullName = "Nguyen Van Moi"; email = $email; phone = "0987654321" } -Token $token
Check "Cap nhat ho so -> 200, du lieu moi" ($r.Status -eq 200 -and $r.Data.user.fullName -eq "Nguyen Van Moi" -and $r.Data.user.phone -eq "0987654321")

$r = Invoke-Api GET "/api/users/me" -Token $token
Check "Ho so da duoc luu lai" ($r.Data.fullName -eq "Nguyen Van Moi")

$r = Invoke-Api PUT "/api/users/me" @{ fullName = "X"; email = "customer@owniverse.com"; phone = "0900000000" } -Token $token
Check "Doi sang email da co nguoi dung -> 409" ($r.Status -eq 409)

$r = Invoke-Api PUT "/api/users/me" @{ fullName = "X" }
Check "Cap nhat ho so khi chua dang nhap -> 401" ($r.Status -eq 401)

$r = Invoke-Api PUT "/api/users/me/password" @{ oldPassword = "sai"; newPassword = "matkhaumoi123" } -Token $token
Check "Doi mat khau, sai mat khau cu -> 400" ($r.Status -eq 400)

$r = Invoke-Api PUT "/api/users/me/password" @{ oldPassword = "matkhau123"; newPassword = "123" } -Token $token
Check "Doi mat khau, mat khau moi qua ngan -> 400" ($r.Status -eq 400)

$r = Invoke-Api PUT "/api/users/me/password" @{ oldPassword = "matkhau123"; newPassword = "matkhaumoi123" } -Token $token
Check "Doi mat khau dung -> 200" ($r.Status -eq 200)

$r = Invoke-Api POST "/api/auth/login" @{ email = $email; password = "matkhau123" }
Check "Dang nhap bang mat khau cu -> 401" ($r.Status -eq 401)

$r = Invoke-Api POST "/api/auth/login" @{ email = $email; password = "matkhaumoi123" }
Check "Dang nhap bang mat khau moi -> 200" ($r.Status -eq 200 -and [bool]$r.Data.token)
$token = $r.Data.token

$r = Invoke-Api POST "/api/auth/logout" -Token $token
Check "Dang xuat -> 200" ($r.Status -eq 200)

$r = Invoke-Api GET "/api/users/me" -Token $token
Check "Token sau khi dang xuat khong dung duoc nua -> 401" ($r.Status -eq 401)

# =====================================================
Write-Host ""
Write-Host "=== NGHE SI (xem va theo doi) ===" -ForegroundColor Cyan
# =====================================================

$r = Invoke-Api GET "/api/artists"
Check "Danh sach nghe si -> 200, co it nhat 3 nghe si" ($r.Status -eq 200 -and @($r.Data).Count -ge 3)
$bad = @($r.Data | Where-Object { -not $_.slug -or -not $_.name -or -not $_.photo -or -not $_.summary })
Check "Moi nghe si deu co slug, name, photo, summary" ($bad.Count -eq 0)

$r = Invoke-Api GET "/api/artists/kairo"
Check "Chi tiet theo slug (kairo) -> 200" ($r.Status -eq 200 -and $r.Data.name -eq "KAIRO")
Check "KAIRO co 5 dau an, 3 hoat dong, 2 MV" (@($r.Data.information).Count -eq 5 -and @($r.Data.activities).Count -eq 3 -and @($r.Data.musicVideos).Count -eq 2)
Check "KAIRO co mang xa hoi va banner quang ba" ([bool]$r.Data.social.youtube -and [bool]$r.Data.promotion.title)

$r = Invoke-Api GET "/api/artists/1"
Check "Chi tiet theo id (1) -> 200, ra KAIRO" ($r.Status -eq 200 -and $r.Data.slug -eq "kairo")

$r = Invoke-Api GET "/api/artists/MIRA"
Check "Slug viet hoa (MIRA) van tim duoc -> 200" ($r.Status -eq 200 -and $r.Data.name -eq "MIRA")

$r = Invoke-Api GET "/api/artists/khong-co"
Check "Nghe si khong ton tai -> 404" ($r.Status -eq 404)

$r = Invoke-Api POST "/api/artists/1/follow"
Check "Theo doi khi chua dang nhap -> 401" ($r.Status -eq 401)

$login = Invoke-Api POST "/api/auth/login" @{ email = $email; password = "matkhaumoi123" }
$token = $login.Data.token

$r = Invoke-Api POST "/api/artists/1/follow" -Token $token
Check "Theo doi nghe si 1 -> 200" ($r.Status -eq 200)

$r = Invoke-Api POST "/api/artists/1/follow" -Token $token
Check "Theo doi lan 2 van 200 (khong bi trung)" ($r.Status -eq 200)

$r = Invoke-Api GET "/api/users/me/following" -Token $token
Check "Danh sach dang theo doi co dung 1 nghe si (id 1)" (@($r.Data).Count -eq 1 -and @($r.Data)[0] -eq 1)

$r = Invoke-Api POST "/api/artists/999/follow" -Token $token
Check "Theo doi nghe si khong ton tai -> 404" ($r.Status -eq 404)

$r = Invoke-Api DELETE "/api/artists/1/follow" -Token $token
Check "Bo theo doi -> 200" ($r.Status -eq 200)

$r = Invoke-Api GET "/api/users/me/following" -Token $token
Check "Sau khi bo theo doi, danh sach rong" (@($r.Data).Count -eq 0)

# =====================================================
Write-Host ""
Write-Host "=== NGHE SI (admin quan ly) ===" -ForegroundColor Cyan
# =====================================================

$newArtist = @{
    name        = "Test Artist $rand"
    genre       = "Pop"
    description = "Nghe si thu nghiem"
    information = @(@{ year = "2026"; title = "Debut"; description = "Test" })
}

$r = Invoke-Api POST "/api/artists" $newArtist
Check "Them nghe si khi chua dang nhap -> 401" ($r.Status -eq 401)

$r = Invoke-Api POST "/api/artists" $newArtist -Token $token
Check "Khach hang them nghe si -> 403" ($r.Status -eq 403)

$admin = Invoke-Api POST "/api/auth/login" @{ email = "admin@owniverse.com"; password = "admin123" }
Check "Dang nhap admin -> 200, vai tro admin" ($admin.Status -eq 200 -and $admin.Data.user.role -eq "admin")
$adminToken = $admin.Data.token

$r = Invoke-Api POST "/api/artists" $newArtist -Token $adminToken
Check "Admin them nghe si -> 201, co id va slug tu dong" ($r.Status -eq 201 -and $r.Data.id -gt 0 -and $r.Data.slug -eq "test-artist-$rand")
$newId = $r.Data.id

$r = Invoke-Api POST "/api/artists" $newArtist -Token $adminToken
Check "Them nghe si trung slug -> 409" ($r.Status -eq 409)

$r = Invoke-Api POST "/api/artists" @{ genre = "Pop" } -Token $adminToken
Check "Them nghe si thieu ten -> 400" ($r.Status -eq 400)

$r = Invoke-Api GET "/api/artists/test-artist-$rand"
Check "Nghe si vua them xem duoc theo slug -> 200" ($r.Status -eq 200 -and $r.Data.genre -eq "Pop")

$r = Invoke-Api GET "/api/artists"
Check "Danh sach nghe si gio co it nhat 4 nghe si" ($r.Status -eq 200 -and @($r.Data).Count -ge 4)

$r = Invoke-Api PUT "/api/artists/$newId" @{ name = "Test Artist Sua $rand"; slug = "test-artist-$rand"; genre = "Rock" } -Token $adminToken
Check "Admin sua nghe si -> 200, ten moi, giu nguyen id" ($r.Status -eq 200 -and $r.Data.name -eq "Test Artist Sua $rand" -and $r.Data.id -eq $newId)

$r = Invoke-Api PUT "/api/artists/$newId" @{ name = "Hack" } -Token $token
Check "Khach hang sua nghe si -> 403" ($r.Status -eq 403)

$r = Invoke-Api PUT "/api/artists/99999" @{ name = "X" } -Token $adminToken
Check "Sua nghe si khong ton tai -> 404" ($r.Status -eq 404)

$r = Invoke-Api DELETE "/api/artists/$newId" -Token $token
Check "Khach hang xoa nghe si -> 403" ($r.Status -eq 403)

$r = Invoke-Api DELETE "/api/artists/$newId" -Token $adminToken
Check "Admin xoa nghe si -> 200" ($r.Status -eq 200)

$r = Invoke-Api GET "/api/artists/test-artist-$rand"
Check "Nghe si da xoa khong con -> 404" ($r.Status -eq 404)

$r = Invoke-Api DELETE "/api/artists/$newId" -Token $adminToken
Check "Xoa lai nghe si da xoa -> 404" ($r.Status -eq 404)

# =====================================================
Write-Host ""
Write-Host "=== DANG NHAP NGHE SI ===" -ForegroundColor Cyan
# =====================================================

$r = Invoke-Api POST "/api/auth/login" @{ email = "kairo@owniverse.com"; password = "Artist123" }
Check "Nghe si KAIRO dang nhap -> 200, vai tro artist" ($r.Status -eq 200 -and $r.Data.user.role -eq "artist")
Check "Tai khoan nghe si co artistId = 1 va artistSlug = kairo" ($r.Data.user.artistId -eq 1 -and $r.Data.user.artistSlug -eq "kairo")
$artistToken = $r.Data.token

$r = Invoke-Api GET "/api/artists/me"
Check "Xem ho so nghe si khi chua dang nhap -> 401" ($r.Status -eq 401)

$r = Invoke-Api GET "/api/artists/me" -Token $token
Check "Khach hang xem ho so nghe si -> 403" ($r.Status -eq 403)

$r = Invoke-Api GET "/api/artists/me" -Token $adminToken
Check "Admin goi /api/artists/me -> 403 (chi danh cho nghe si)" ($r.Status -eq 403)

$r = Invoke-Api GET "/api/artists/me" -Token $artistToken
Check "Nghe si xem ho so cua minh -> 200, ra KAIRO" ($r.Status -eq 200 -and $r.Data.name -eq "KAIRO")
$origDescription = $r.Data.description

$r = Invoke-Api PUT "/api/artists/me" @{ description = "Mo ta thu nghiem $rand"; name = "HACK"; slug = "hack" } -Token $artistToken
Check "Nghe si sua mo ta -> 200, mo ta moi" ($r.Status -eq 200 -and $r.Data.description -eq "Mo ta thu nghiem $rand")
Check "Nghe si khong doi duoc ten va slug" ($r.Data.name -eq "KAIRO" -and $r.Data.slug -eq "kairo")

$r = Invoke-Api GET "/api/artists/kairo"
Check "Trang cong khai thay mo ta moi" ($r.Data.description -eq "Mo ta thu nghiem $rand")
Check "Cac phan khac cua ho so van con (5 dau an)" (@($r.Data.information).Count -eq 5)

$r = Invoke-Api PUT "/api/artists/me" @{ description = $origDescription } -Token $artistToken
Check "Khoi phuc mo ta ban dau -> 200" ($r.Status -eq 200 -and $r.Data.description -eq $origDescription)

$r = Invoke-Api PUT "/api/artists/me" @{ description = "x" } -Token $token
Check "Khach hang sua ho so nghe si -> 403" ($r.Status -eq 403)

$r = Invoke-Api POST "/api/artists" @{ name = "Hack $rand" } -Token $artistToken
Check "Nghe si them nghe si khac -> 403" ($r.Status -eq 403)

$r = Invoke-Api GET "/api/admin/users" -Token $artistToken
Check "Nghe si vao API quan tri -> 403" ($r.Status -eq 403)

# =====================================================
Write-Host ""
Write-Host "=== QUAN TRI: TAI KHOAN ===" -ForegroundColor Cyan
# =====================================================

$adminId = $admin.Data.user.id

$r = Invoke-Api GET "/api/admin/users"
Check "Danh sach tai khoan khi chua dang nhap -> 401" ($r.Status -eq 401)

$r = Invoke-Api GET "/api/admin/users" -Token $token
Check "Khach hang xem danh sach tai khoan -> 403" ($r.Status -eq 403)

$r = Invoke-Api GET "/api/admin/users" -Token $adminToken
Check "Admin xem danh sach tai khoan -> 200, it nhat 6 tai khoan" ($r.Status -eq 200 -and @($r.Data).Count -ge 6)
$leak = @($r.Data | Where-Object { $null -ne $_.password })
Check "Danh sach tai khoan khong tra ve mat khau" ($leak.Count -eq 0)

$r = Invoke-Api GET "/api/admin/users?role=artist" -Token $adminToken
$wrong = @($r.Data | Where-Object { $_.role -ne "artist" })
Check "Loc theo vai tro artist -> it nhat 3, deu la artist" (@($r.Data).Count -ge 3 -and $wrong.Count -eq 0)

$r = Invoke-Api GET "/api/admin/users?q=kairo" -Token $adminToken
Check "Tim tai khoan theo tu khoa 'kairo' -> co ket qua" (@($r.Data).Count -ge 1)

$newUserEmail = "artist$rand@owniverse.com"
$r = Invoke-Api POST "/api/admin/users" @{ fullName = "Nghe si Test"; email = $newUserEmail; password = "Artist12345"; role = "artist" } -Token $token
Check "Khach hang tao tai khoan -> 403" ($r.Status -eq 403)

$r = Invoke-Api POST "/api/admin/users" @{ fullName = "Nghe si Test"; email = $newUserEmail; password = "Artist12345"; role = "artist" } -Token $adminToken
Check "Admin tao tai khoan artist -> 201" ($r.Status -eq 201 -and $r.Data.role -eq "artist" -and $r.Data.status -eq "active")
$newUserId = $r.Data.id

$r = Invoke-Api POST "/api/admin/users" @{ fullName = "Trung"; email = $newUserEmail; password = "Artist12345" } -Token $adminToken
Check "Tao tai khoan trung email -> 409" ($r.Status -eq 409)

$r = Invoke-Api POST "/api/admin/users" @{ fullName = "Sai"; email = "role$rand@gmail.com"; password = "Artist12345"; role = "superman" } -Token $adminToken
Check "Tao tai khoan vai tro khong hop le -> 400" ($r.Status -eq 400)

$r = Invoke-Api POST "/api/admin/users" @{ fullName = "Ngan"; email = "short$rand@gmail.com"; password = "123" } -Token $adminToken
Check "Tao tai khoan mat khau qua ngan -> 400" ($r.Status -eq 400)

$r = Invoke-Api GET "/api/admin/users/$newUserId" -Token $adminToken
Check "Xem 1 tai khoan -> 200, dung email" ($r.Status -eq 200 -and $r.Data.email -eq $newUserEmail)

$r = Invoke-Api GET "/api/admin/users/99999" -Token $adminToken
Check "Xem tai khoan khong ton tai -> 404" ($r.Status -eq 404)

$r = Invoke-Api PUT "/api/admin/users/$newUserId" @{ fullName = "Doi Ten $rand"; phone = "0911111111" } -Token $adminToken
Check "Admin sua ten va so dien thoai -> 200" ($r.Status -eq 200 -and $r.Data.fullName -eq "Doi Ten $rand" -and $r.Data.phone -eq "0911111111")
Check "Sua tai khoan khong lam mat vai tro cu (artist)" ($r.Data.role -eq "artist")

$r = Invoke-Api PUT "/api/admin/users/$newUserId" @{ email = "customer@owniverse.com" } -Token $adminToken
Check "Doi sang email da co nguoi dung -> 409" ($r.Status -eq 409)

$r = Invoke-Api PUT "/api/admin/users/$newUserId" @{ role = "superman" } -Token $adminToken
Check "Doi sang vai tro khong hop le -> 400" ($r.Status -eq 400)

# ----- Lien ket tai khoan nghe si -----
$linkArtist = Invoke-Api POST "/api/artists" @{ name = "Link Artist $rand"; genre = "Indie" } -Token $adminToken
$linkId = $linkArtist.Data.id
Check "Nghe si moi tao chua co tai khoan lien ket" ($linkArtist.Status -eq 201 -and $null -eq $linkArtist.Data.userId)

$r = Invoke-Api PUT "/api/admin/artists/$linkId/account" @{ userId = $newUserId } -Token $token
Check "Khach hang gan tai khoan cho nghe si -> 403" ($r.Status -eq 403)

$r = Invoke-Api PUT "/api/admin/artists/$linkId/account" @{ userId = 3 } -Token $adminToken
Check "Gan tai khoan khong phai artist -> 400" ($r.Status -eq 400)

$r = Invoke-Api PUT "/api/admin/artists/$linkId/account" @{ userId = 99999 } -Token $adminToken
Check "Gan tai khoan khong ton tai -> 404" ($r.Status -eq 404)

$r = Invoke-Api PUT "/api/admin/artists/99999/account" @{ userId = $newUserId } -Token $adminToken
Check "Gan cho nghe si khong ton tai -> 404" ($r.Status -eq 404)

$r = Invoke-Api PUT "/api/admin/artists/$linkId/account" @{ userId = 4 } -Token $adminToken
Check "Gan tai khoan dang lien ket voi nghe si khac (KAIRO) -> 409" ($r.Status -eq 409)

$r = Invoke-Api PUT "/api/admin/artists/$linkId/account" @{ userId = $newUserId } -Token $adminToken
Check "Admin gan tai khoan cho nghe si -> 200, userId dung" ($r.Status -eq 200 -and $r.Data.userId -eq $newUserId)

$r = Invoke-Api POST "/api/auth/login" @{ email = $newUserEmail; password = "Artist12345" }
Check "Tai khoan vua gan dang nhap duoc, co artistId" ($r.Status -eq 200 -and $r.Data.user.artistId -eq $linkId)
$newUserToken = $r.Data.token

$r = Invoke-Api GET "/api/artists/me" -Token $newUserToken
Check "Nghe si moi xem ho so cua minh -> 200" ($r.Status -eq 200 -and $r.Data.id -eq $linkId)

# ----- Khoa / mo khoa -----
$r = Invoke-Api PUT "/api/admin/users/$newUserId/status" @{ status = "locked" } -Token $token
Check "Khach hang khoa tai khoan -> 403" ($r.Status -eq 403)

$r = Invoke-Api PUT "/api/admin/users/$newUserId/status" @{ status = "abc" } -Token $adminToken
Check "Trang thai khong hop le -> 400" ($r.Status -eq 400)

$r = Invoke-Api PUT "/api/admin/users/$newUserId/status" @{ status = "locked" } -Token $adminToken
Check "Admin khoa tai khoan -> 200, status locked" ($r.Status -eq 200 -and $r.Data.user.status -eq "locked")

$r = Invoke-Api GET "/api/users/me" -Token $newUserToken
Check "Phien dang nhap cua tai khoan bi khoa bi huy -> 401" ($r.Status -eq 401)

$r = Invoke-Api POST "/api/auth/login" @{ email = $newUserEmail; password = "Artist12345" }
Check "Tai khoan bi khoa khong dang nhap duoc -> 403" ($r.Status -eq 403)

$r = Invoke-Api PUT "/api/admin/users/$newUserId/status" @{ status = "active" } -Token $adminToken
Check "Admin mo khoa -> 200, status active" ($r.Status -eq 200 -and $r.Data.user.status -eq "active")

$r = Invoke-Api POST "/api/auth/login" @{ email = $newUserEmail; password = "Artist12345" }
Check "Mo khoa xong dang nhap lai duoc -> 200" ($r.Status -eq 200 -and [bool]$r.Data.token)

# ----- Tu bao ve -----
$r = Invoke-Api PUT "/api/admin/users/$adminId/status" @{ status = "locked" } -Token $adminToken
Check "Admin tu khoa minh -> 400" ($r.Status -eq 400)

$r = Invoke-Api DELETE "/api/admin/users/$adminId" -Token $adminToken
Check "Admin tu xoa minh -> 400" ($r.Status -eq 400)

$r = Invoke-Api PUT "/api/admin/users/$adminId" @{ role = "customer" } -Token $adminToken
Check "Admin tu ha quyen minh -> 400" ($r.Status -eq 400)

$r = Invoke-Api GET "/api/users/me" -Token $adminToken
Check "Admin van con quyen sau cac thao tac tren" ($r.Status -eq 200 -and $r.Data.role -eq "admin")

# ----- Dat lai mat khau -----
$r = Invoke-Api PUT "/api/admin/users/$newUserId/password" @{ newPassword = "123" } -Token $adminToken
Check "Dat lai mat khau qua ngan -> 400" ($r.Status -eq 400)

$r = Invoke-Api PUT "/api/admin/users/$newUserId/password" @{ newPassword = "MatKhauMoi123" } -Token $adminToken
Check "Admin dat lai mat khau -> 200" ($r.Status -eq 200)

$r = Invoke-Api POST "/api/auth/login" @{ email = $newUserEmail; password = "Artist12345" }
Check "Dang nhap bang mat khau cu -> 401" ($r.Status -eq 401)

$r = Invoke-Api POST "/api/auth/login" @{ email = $newUserEmail; password = "MatKhauMoi123" }
Check "Dang nhap bang mat khau moi -> 200" ($r.Status -eq 200)

# ----- Doi vai tro -> go lien ket nghe si -----
$r = Invoke-Api PUT "/api/admin/users/$newUserId" @{ role = "customer" } -Token $adminToken
Check "Admin ha tai khoan xuong customer -> 200" ($r.Status -eq 200 -and $r.Data.role -eq "customer")

$r = Invoke-Api GET "/api/artists/$linkId"
Check "Ho so nghe si bi go lien ket tai khoan (userId rong)" ($r.Status -eq 200 -and $null -eq $r.Data.userId)

# ----- Xoa -----
$r = Invoke-Api DELETE "/api/admin/users/$newUserId" -Token $token
Check "Khach hang xoa tai khoan -> 403" ($r.Status -eq 403)

$r = Invoke-Api DELETE "/api/admin/users/$newUserId" -Token $adminToken
Check "Admin xoa tai khoan -> 200" ($r.Status -eq 200)

$r = Invoke-Api GET "/api/admin/users/$newUserId" -Token $adminToken
Check "Tai khoan da xoa khong con -> 404" ($r.Status -eq 404)

$r = Invoke-Api POST "/api/auth/login" @{ email = $newUserEmail; password = "MatKhauMoi123" }
Check "Tai khoan da xoa khong dang nhap duoc -> 401" ($r.Status -eq 401)

$r = Invoke-Api DELETE "/api/artists/$linkId" -Token $adminToken
Check "Don dep: xoa nghe si thu nghiem -> 200" ($r.Status -eq 200)

# =====================================================
Write-Host ""
Write-Host "=== QUAN TRI: DANH MUC ===" -ForegroundColor Cyan
# =====================================================

$r = Invoke-Api GET "/api/admin/categories"
Check "Danh muc khi chua dang nhap -> 401" ($r.Status -eq 401)

$r = Invoke-Api GET "/api/admin/categories" -Token $token
Check "Khach hang xem danh muc quan tri -> 403" ($r.Status -eq 403)

$r = Invoke-Api GET "/api/admin/categories" -Token $adminToken
Check "Admin xem danh muc -> 200, it nhat 3 danh muc co productCount" ($r.Status -eq 200 -and @($r.Data).Count -ge 3 -and $null -ne @($r.Data)[0].productCount)

$r = Invoke-Api POST "/api/admin/categories" @{ name = "Danh muc test $rand" } -Token $adminToken
Check "Admin them danh muc -> 201, slug tu dong" ($r.Status -eq 201 -and $r.Data.slug -eq "danh-muc-test-$rand")
$catId = $r.Data.id

$r = Invoke-Api POST "/api/admin/categories" @{ name = "Danh muc test $rand" } -Token $adminToken
Check "Them danh muc trung -> 409" ($r.Status -eq 409)

$r = Invoke-Api POST "/api/admin/categories" @{ slug = "abc" } -Token $adminToken
Check "Them danh muc thieu ten -> 400" ($r.Status -eq 400)

$r = Invoke-Api POST "/api/admin/categories" @{ name = "Hack" } -Token $token
Check "Khach hang them danh muc -> 403" ($r.Status -eq 403)

$r = Invoke-Api PUT "/api/admin/categories/$catId" @{ name = "Ten moi $rand" } -Token $adminToken
Check "Admin sua ten danh muc -> 200, giu slug" ($r.Status -eq 200 -and $r.Data.name -eq "Ten moi $rand" -and $r.Data.slug -eq "danh-muc-test-$rand")

$r = Invoke-Api PUT "/api/admin/categories/$catId" @{ slug = "ao" } -Token $adminToken
Check "Doi slug trung danh muc khac -> 409" ($r.Status -eq 409)

$r = Invoke-Api PUT "/api/admin/categories/99999" @{ name = "X" } -Token $adminToken
Check "Sua danh muc khong ton tai -> 404" ($r.Status -eq 404)

$r = Invoke-Api DELETE "/api/admin/categories/1" -Token $adminToken
Check "Xoa danh muc con san pham -> 409" ($r.Status -eq 409)

$r = Invoke-Api DELETE "/api/admin/categories/$catId" -Token $adminToken
Check "Xoa danh muc rong -> 200" ($r.Status -eq 200)

$r = Invoke-Api DELETE "/api/admin/categories/$catId" -Token $adminToken
Check "Xoa lai danh muc da xoa -> 404" ($r.Status -eq 404)

# =====================================================
Write-Host ""
Write-Host "=== QUAN TRI: SAN PHAM (hang hoa) ===" -ForegroundColor Cyan
# =====================================================

$r = Invoke-Api GET "/api/admin/products"
Check "Danh sach san pham khi chua dang nhap -> 401" ($r.Status -eq 401)

$r = Invoke-Api GET "/api/admin/products" -Token $token
Check "Khach hang xem san pham quan tri -> 403" ($r.Status -eq 403)

$r = Invoke-Api GET "/api/admin/products" -Token $adminToken
Check "Admin xem san pham -> 200, it nhat 18 san pham" ($r.Status -eq 200 -and @($r.Data).Count -ge 18)
$baseCount = @($r.Data).Count
$bad = @($r.Data | Where-Object { -not $_.artistName -or -not $_.categoryName -or $null -eq $_.totalStock })
Check "Moi san pham co ten nghe si, ten danh muc, tong ton kho" ($bad.Count -eq 0)

$r = Invoke-Api GET "/api/admin/products?artistId=1" -Token $adminToken
$wrong = @($r.Data | Where-Object { $_.artistId -ne 1 })
Check "Loc theo nghe si 1 -> 6 san pham, deu cua KAIRO" (@($r.Data).Count -eq 6 -and $wrong.Count -eq 0)

$r = Invoke-Api GET "/api/admin/products?q=hoodie" -Token $adminToken
Check "Tim 'hoodie' -> co ket qua" (@($r.Data).Count -ge 1)

$r = Invoke-Api GET "/api/admin/products?q=ao%20thun" -Token $adminToken
Check "Tim 'ao thun' (khong dau) ra duoc 'Ao thun' co dau" (@($r.Data).Count -ge 1)

$r = Invoke-Api GET "/api/admin/products/1" -Token $adminToken
Check "Xem 1 san pham -> 200, co bien the" ($r.Status -eq 200 -and @($r.Data.variants).Count -ge 1)

$r = Invoke-Api GET "/api/admin/products/99999" -Token $adminToken
Check "Xem san pham khong ton tai -> 404" ($r.Status -eq 404)

# ----- Them san pham: kiem tra loi -----
$goodProduct = @{ name = "Test SP $rand"; description = "San pham thu nghiem"; price = 123000; artistId = 1; categoryId = 2 }

$r = Invoke-Api POST "/api/admin/products" $goodProduct -Token $token
Check "Khach hang them san pham -> 403" ($r.Status -eq 403)

$r = Invoke-Api POST "/api/admin/products" @{ price = 1000; artistId = 1; categoryId = 2 } -Token $adminToken
Check "Them san pham thieu ten -> 400" ($r.Status -eq 400)

$r = Invoke-Api POST "/api/admin/products" @{ name = "A"; price = 0; artistId = 1; categoryId = 2 } -Token $adminToken
Check "Them san pham gia = 0 -> 400" ($r.Status -eq 400)

$r = Invoke-Api POST "/api/admin/products" @{ name = "A"; price = 1000; artistId = 999; categoryId = 2 } -Token $adminToken
Check "Them san pham nghe si khong ton tai -> 400" ($r.Status -eq 400)

$r = Invoke-Api POST "/api/admin/products" @{ name = "A"; price = 1000; artistId = 1; categoryId = 999 } -Token $adminToken
Check "Them san pham danh muc khong ton tai -> 400" ($r.Status -eq 400)

$r = Invoke-Api POST "/api/admin/products" @{ name = "A"; price = 1000; artistId = 1; categoryId = 2; status = "abc" } -Token $adminToken
Check "Them san pham trang thai sai -> 400" ($r.Status -eq 400)

$r = Invoke-Api GET "/api/admin/products" -Token $adminToken
Check "Cac lan them loi khong tao ra san pham nao" (@($r.Data).Count -eq $baseCount)

# ----- Them san pham: thanh cong -----
$withVariants = $goodProduct.Clone()
$withVariants.variants = @(
    @{ sku = "TST-$rand-M"; name = "Size M"; stock = 5 },
    @{ sku = "TST-$rand-L"; name = "Size L"; stock = 7 }
)
$r = Invoke-Api POST "/api/admin/products" $withVariants -Token $adminToken
Check "Admin them san pham co 2 bien the -> 201" ($r.Status -eq 201 -and $r.Data.id -gt 0 -and @($r.Data.variants).Count -eq 2)
Check "Tong ton kho = 12, trang thai active" ($r.Data.totalStock -eq 12 -and $r.Data.status -eq "active")
Check "Co ten nghe si KAIRO va ten danh muc" ($r.Data.artistName -eq "KAIRO" -and [bool]$r.Data.categoryName)
$prodId = $r.Data.id
$variantM = @($r.Data.variants)[0].id
$variantL = @($r.Data.variants)[1].id

$r = Invoke-Api POST "/api/admin/products" @{ name = "Trung SKU $rand"; price = 1000; artistId = 1; categoryId = 2; variants = @(@{ sku = "TST-$rand-M"; name = "X"; stock = 1 }) } -Token $adminToken
Check "Them san pham trung SKU -> 409" ($r.Status -eq 409)

$r = Invoke-Api GET "/api/admin/products?q=Trung SKU $rand" -Token $adminToken
Check "San pham them loi (trung SKU) khong bi luu lai" (@($r.Data).Count -eq 0)

$noVariant = Invoke-Api POST "/api/admin/products" @{ name = "Khong bien the $rand"; price = 50000; artistId = 2; categoryId = 1 } -Token $adminToken
Check "Them san pham khong gui bien the -> 201, tu tao 1 bien the" ($noVariant.Status -eq 201 -and @($noVariant.Data.variants).Count -eq 1 -and $noVariant.Data.totalStock -eq 0)
$prod2Id = $noVariant.Data.id
$prod2Variant = @($noVariant.Data.variants)[0].id

# ----- Sua san pham -----
$r = Invoke-Api PUT "/api/admin/products/$prodId" @{ price = 150000; status = "hidden" } -Token $adminToken
Check "Admin sua gia va an san pham -> 200" ($r.Status -eq 200 -and $r.Data.price -eq 150000 -and $r.Data.status -eq "hidden")
Check "Cac truong khong gui van giu nguyen (ten, nghe si)" ($r.Data.name -eq "Test SP $rand" -and $r.Data.artistId -eq 1)

$r = Invoke-Api PUT "/api/admin/products/$prodId" @{ price = -5 } -Token $adminToken
Check "Sua gia am -> 400" ($r.Status -eq 400)

$r = Invoke-Api PUT "/api/admin/products/$prodId" @{ name = "Doi ten"; price = -5 } -Token $adminToken
Check "Sua loi (gia am) khong lam doi ten (khong sua nua chung)" ($r.Status -eq 400)

$r = Invoke-Api GET "/api/admin/products/$prodId" -Token $adminToken
Check "San pham van giu ten va gia cu sau lan sua loi" ($r.Data.name -eq "Test SP $rand" -and $r.Data.price -eq 150000)

$r = Invoke-Api PUT "/api/admin/products/$prodId" @{ categoryId = 999 } -Token $adminToken
Check "Sua sang danh muc khong ton tai -> 400" ($r.Status -eq 400)

$r = Invoke-Api PUT "/api/admin/products/$prodId" @{ name = "Hack" } -Token $token
Check "Khach hang sua san pham -> 403" ($r.Status -eq 403)

$r = Invoke-Api PUT "/api/admin/products/99999" @{ name = "X" } -Token $adminToken
Check "Sua san pham khong ton tai -> 404" ($r.Status -eq 404)

$r = Invoke-Api GET "/api/admin/products?status=hidden" -Token $adminToken
$found = @($r.Data | Where-Object { $_.id -eq $prodId })
Check "Loc status=hidden thay san pham vua an" ($found.Count -eq 1)

# ----- Bien the va ton kho -----
$r = Invoke-Api POST "/api/admin/products/$prodId/variants" @{ sku = "TST-$rand-XL"; name = "Size XL"; stock = 3 } -Token $adminToken
Check "Them bien the XL -> 201, co 3 bien the, ton kho 15" ($r.Status -eq 201 -and @($r.Data.variants).Count -eq 3 -and $r.Data.totalStock -eq 15)

$r = Invoke-Api POST "/api/admin/products/$prodId/variants" @{ sku = "TST-$rand-XL"; name = "Trung"; stock = 1 } -Token $adminToken
Check "Them bien the trung SKU -> 409" ($r.Status -eq 409)

$r = Invoke-Api POST "/api/admin/products/$prodId/variants" @{ sku = "TST-$rand-NEG"; name = "Am"; stock = -1 } -Token $adminToken
Check "Them bien the ton kho am -> 400" ($r.Status -eq 400)

$r = Invoke-Api POST "/api/admin/products/99999/variants" @{ sku = "ZZZ"; name = "X"; stock = 1 } -Token $adminToken
Check "Them bien the cho san pham khong ton tai -> 404" ($r.Status -eq 404)

$r = Invoke-Api PUT "/api/admin/products/$prodId/variants/$variantM" @{ stock = 20 } -Token $adminToken
Check "Cap nhat ton kho Size M = 20 -> 200, tong ton kho 30" ($r.Status -eq 200 -and $r.Data.totalStock -eq 30)

$r = Invoke-Api PUT "/api/admin/products/$prodId/variants/$variantM" @{ stock = -1 } -Token $adminToken
Check "Cap nhat ton kho am -> 400" ($r.Status -eq 400)

$r = Invoke-Api PUT "/api/admin/products/$prodId/variants/$variantM" @{ sku = "TST-$rand-L" } -Token $adminToken
Check "Doi SKU trung bien the khac -> 409" ($r.Status -eq 409)

$r = Invoke-Api PUT "/api/admin/products/$prodId/variants/99999" @{ stock = 1 } -Token $adminToken
Check "Sua bien the khong ton tai -> 404" ($r.Status -eq 404)

$r = Invoke-Api PUT "/api/admin/products/$prodId/variants/$variantM" @{ stock = 1 } -Token $token
Check "Khach hang sua ton kho -> 403" ($r.Status -eq 403)

$r = Invoke-Api DELETE "/api/admin/products/$prodId/variants/$variantL" -Token $adminToken
Check "Xoa bien the Size L -> 200, con 2 bien the" ($r.Status -eq 200 -and @($r.Data.variants).Count -eq 2)

$r = Invoke-Api DELETE "/api/admin/products/$prod2Id/variants/$prod2Variant" -Token $adminToken
Check "Xoa bien the cuoi cung cua san pham -> 409" ($r.Status -eq 409)

# ----- Rang buoc voi nghe si -----
$r = Invoke-Api DELETE "/api/artists/1" -Token $adminToken
Check "Xoa nghe si con san pham -> 409" ($r.Status -eq 409)

$r = Invoke-Api GET "/api/artists/1"
Check "KAIRO van con sau khi xoa that bai" ($r.Status -eq 200)

# ----- Xoa san pham -----
$r = Invoke-Api DELETE "/api/admin/products/$prodId" -Token $token
Check "Khach hang xoa san pham -> 403" ($r.Status -eq 403)

$r = Invoke-Api DELETE "/api/admin/products/$prodId" -Token $adminToken
Check "Admin xoa san pham -> 200" ($r.Status -eq 200)

$r = Invoke-Api DELETE "/api/admin/products/$prod2Id" -Token $adminToken
Check "Don dep: xoa san pham thu nghiem thu 2 -> 200" ($r.Status -eq 200)

$r = Invoke-Api GET "/api/admin/products/$prodId" -Token $adminToken
Check "San pham da xoa khong con -> 404" ($r.Status -eq 404)

$r = Invoke-Api DELETE "/api/admin/products/$prodId" -Token $adminToken
Check "Xoa lai san pham da xoa -> 404" ($r.Status -eq 404)

$r = Invoke-Api GET "/api/admin/products" -Token $adminToken
Check "Sau khi don dep, so san pham tro ve nhu ban dau" (@($r.Data).Count -eq $baseCount)

# =====================================================
Write-Host ""
$total = $script:pass + $script:fail
if ($script:fail -eq 0) {
    Write-Host "KET QUA: $($script:pass)/$total dat. API hoat dong day du." -ForegroundColor Green
}
else {
    Write-Host "KET QUA: $($script:pass)/$total dat, $($script:fail) LOI (xem cac dong FAIL o tren)." -ForegroundColor Red
    exit 1
}