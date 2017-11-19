$(document).ready(function(){
      $('.user-profile').click(function() {
          if(!$(this).hasClass('active')){
              
              $('.user-profile.active').removeClass('active');
              $(this).addClass('active');
              
              var temp =  $('#'+$(this).attr('data-up'));
              
              hideUI('.chat-container')
              showUI('#'+$(this).attr('data-up'));
              temp.addClass('active').removeClass('hidechat');
              temp.prevAll('.chat-container').addClass('hidechat').removeClass('active');
              temp.nextAll('.chat-container').removeClass('active').removeClass('hidechat');
          }
      });
      showUI('#cont1');
  });
  
function showUI(ele){
    console.log($(ele));
    var kids = $(ele).children(), temp;
    for( var i = kids.length-1 ; i >=0  ; i-- ){
        temp  = $(kids[i]);
        
        if(temp.is('div')){
            temp.animate({
                marginTop:0,
            },400).css({opacity:1}).fadeIn()
        }
        else{
            temp.css({opacity:1}).fadeIn()
        }   
    }
}

function hideUI(ele){
    console.log($(ele));
    var kids = $(ele).children(), temp;
    for( var i = kids.length-1 ; i >=0  ; i-- ){
        temp  = $(kids[i]);
        
        if(temp.is('div')){
            temp.animate({
                marginTop:'30px',
            }).css({opacity:0});
        }
        else{
            temp.css({opacity:0});
        }   
    }
}

$("#new-chat").click(function() {
  $("#myModal").show();
});

$(".close").click(function(){
  $("#myModal").hide();
});

$(document).click(function(event){
  if($(event.target).is('#myModal') && !$(event.target).is('#new-chat')) {
    if($('#myModal').css('display') != 'none') {
      $('#myModal').hide();
    }
  }
});



