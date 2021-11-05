$(document).ready(function () {

    const openLogoutBtn = $('#openLogoutBtn')
    const $logoutModal = $('#logoutModal')
    const $closeLogoutBtn = $('#closeLogoutBtn')
    const $logoutBtn = $('#logoutBtn')

    openLogoutBtn.click(function () {
        $logoutModal.addClass('is-active')
    })

    $logoutModal.click(function(e) {
        if (e.target.id === 'modalBg') {
            $logoutModal.removeClass('is-active')
        }
    })

    $closeLogoutBtn.click(function() {
        $logoutModal.removeClass('is-active')
    })

    $logoutBtn.click(function() {
        $.removeCookie('mytoken', { path: '/' })
        window.location.href = '/'
    })

})