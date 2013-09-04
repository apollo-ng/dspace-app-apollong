define([], function(){
  function Auth(server){
    var currentEmail = dspace.world.user.get('email');
    
    function verifyAssertion(assertion) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", server, true);
      var param = "assertion="+assertion;
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.onload = function(){
        if(xhr.status == 200) {
          var data;
          try {
             data = JSON.parse(xhr.responseText);
          } catch(e) {
            console.error("error parsing authentication response", e);
            return;
          }
          dspace.world.user.set('buddyradarToken', data.token);
          dspace.world.user.set('email', data.persona_response.email);
          dspace.world.user.save();
        } else {
          navigator.id.logout();
          console.error("persona error : ", xhr.status, xhr.responseText);
          alert("try{ UNDEFINED.toLowerCase()} cattch(e) {console.error(e)}")
        }
      }
      xhr.send(param); 

    }

    function signoutUser() {
      console.log('sing out!', arguments);
    }

    navigator.id.watch( {
      loggedInUser: currentEmail,
      onlogin: verifyAssertion,
      onlogout: signoutUser } );

  }
  Auth.prototype = {
    login : function(){
      navigator.id.request();
    },
    logout : function(){
      navigator.id.signout();
    }
  }

  return Auth;

})
