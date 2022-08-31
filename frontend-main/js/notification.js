//check notifications every 5 seconds
$( document ).ready(function() {
    checkNewNotifications();
    window.setInterval(checkNewNotifications, 5000);
});

//mark as read on dropdown exit
$('#notification-dropdown').on('hidden.bs.dropdown', function () {
    markAsReadNotifications();
});

//do not mark as read or exit on click inside the container
$(document).on('click', '#notification-dropdown .dropdown-menu', function (e) {
    e.stopPropagation();
});

function checkNewNotifications(){

    let currentNotificationCount = $('#badge-notification').text();

    let headDropdownNotification = '<h6 class="dropdown-header">Notifications</h6>';
    let footDropdownNotification = '<a class="dropdown-item text-center small text-gray-500" href="/notifications.html">Voir toutes mes notifications</a>';
    $.getJSON('/notification-service/unread').then(function (response) {
        if(response.length > 0 && currentNotificationCount != response.length){
            $('#badge-notification').text(response.length);
            $('#badge-notification').removeClass("d-none");

            let dropDownContent = "";
            for (let i = 0; i < response.length; i++) {
                const element = response[i];
                const dateNotif = new Date(element.timestamp);
                let hours = dateNotif.getHours();
                let mins = dateNotif.getMinutes();
                if (hours   < 10) {hours   = "0"+hours;}
                if (mins   < 10) {mins   = "0"+mins;}
                dropDownContent += `<a class="dropdown-item d-flex align-items-center" href="/notifications.html">
                    <div>
                        <div class="small text-gray-500">`+dateNotif.getDate()+"/"+(dateNotif.getMonth()+1)+"/"+dateNotif.getFullYear()+" "+hours+":"+mins+`</div>
                        <span class="font-weight-bold">`+element.content+`</span>
                    </div>
                </a>`;
            }

            $("#notification-dropdown-tab").html(headDropdownNotification+dropDownContent+footDropdownNotification);
        }
    });
}


function markAsReadNotifications(){
    $.post('/notification-service/markAsRead')
    .done(function(msg){ 
        $('#badge-notification').text(0);
        $('#badge-notification').addClass("d-none");
        $("#notification-dropdown-tab").html(`
            <h6 class="dropdown-header">Notifications</h6>
            <a class="dropdown-item d-flex align-items-center" href="#">
                <div>
                    Pas de nouvelle notification
                </div>
            </a>
            <a class="dropdown-item text-center small text-gray-500" href="/notifications.html">Voir toutes mes notifications</a>`
        );
     })
    .fail(function(xhr, status, error) {
        $.notify("Could not mark notifications as read", "error");
    });
}