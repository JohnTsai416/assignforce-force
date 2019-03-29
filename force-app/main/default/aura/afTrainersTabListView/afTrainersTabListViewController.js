({
   doInit : function(component, event, helper) {
       var trainers    = [];
       var cotrainers    = [];
       var trnrAction     = component.get("c.allTrainers");

       //setCallback runs when the remote method call returns.
       //For more information on callbacks, see this Unit https://trailhead.salesforce.com/en/content/learn/modules/lex_dev_lc_basics/lex_dev_lc_basics_server
       trnrAction.setCallback(this, function(response) {
           var state = response.getState();
           if (state === "SUCCESS") {
               trainers = response.getReturnValue();
               component.set("v.trainers", trainers);
			
           } else if (state === "ERROR"){
               var errors = response.getError();
               if (errors) {
                   if (errors[0] && errors[0].message) {
                       console.log('Error message: ' + errors[0].message);
                   }
               }
           } else {
               console.log('Unknown error.')
           }
       })
       $A.enqueueAction(trnrAction);
   },


})