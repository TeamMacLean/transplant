$(function(){
    initUserMenu();
    initAreYouSureButtons();
});

function initUserMenu() {
    var user = $('.user');

    user.on('mouseenter', function () {
        $('.user-menu').removeClass('hidden');

    });
    user.on('mouseleave', function () {
        $('.user-menu').addClass('hidden');
    });
}

function initAreYouSureButtons() {
    $('.areyousure').click(function () {
        return window.confirm('Are you sure?');
    });
}