$(document).ready(function () {

    const openLogoutBtn = $('#openLogoutBtn')
    const $logoutModal = $('#logoutModal')
    const $closeLogoutBtn = $('#closeLogoutBtn')
    const $logoutBtn = $('#logoutBtn')

    // 로그아웃 버튼 클릭 시 모달 열기
    openLogoutBtn.click(function () {
        $logoutModal.addClass('is-active')
    })

    // 로그아웃 모달 닫기 동작
    $logoutModal.click(function(e) {
        if (e.target.id === 'modalBg') {
            $logoutModal.removeClass('is-active')
        }
    })

    // 로그아웃 모달 닫기 동작
    $closeLogoutBtn.click(function() {
        $logoutModal.removeClass('is-active')
    })

    // 로그아웃 시 사용자 쿠키(토큰) 삭제
    $logoutBtn.click(function() {
        $.removeCookie('mytoken', { path: '/' })
        window.location.href = '/'
    })

})