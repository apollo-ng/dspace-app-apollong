define([], function() {

   dspace.plugin({
     name: "Hello",
     description: "Prints a nice greeting to the console.",
     authors: ['Niklas E. Cathor <nilclass@riseup.net>'],
     version: '0.1',
     
     hooks: {
       load: function() {
         console.log('plugin says: Hello World !');
       }
     }
   });

});
