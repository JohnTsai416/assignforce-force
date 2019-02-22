({
    doInit : function(component, event, helper) {
        
        // get all Training_Room__c records
        var allRooms = [];
        var roomAction = component.get("c.allRooms");
        
        roomAction.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                allRooms = response.getReturnValue();
                component.set("v.roomList", allRooms);
                
                /* get all Training__c records */
                var openTrainings = [];
                var trngAction = component.get("c.allTrainings");
                
                trngAction.setCallback(this, function(response) {
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        openTrainings = response.getReturnValue();
                        component.set("v.openTrainings", openTrainings);
                        
                        // get all User records with Trainer/CoTrainer roles
                        var trainers = [];
                        var cotrainers = [];
                        var trnrAction = component.get("c.allTrainers");
                        
                        trnrAction.setCallback(this, function(response) {
                            var state = response.getState();
                            if (state === "SUCCESS") {
                                trainers = response.getReturnValue();
                                
                                for(var i = 0; i < trainers.length; i++) {
                                    // CoTrainers removed and added to separate list
                                    if(trainers[i].RoleName == 'CoTrainer') {
                                        var ct = trainers[i];
                                        trainers.splice(i, i+1);
                                        cotrainers.push(ct);
                                        i--; // changing the length of list means ensuring we don't skip values
                                    }
                                }
                                component.set("v.allTrainers", trainers);
                                component.set("v.allCoTrainers", cotrainers);
                                
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
                        // end of getting all User records with Trainer/CoTrainer roles
                        
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
                $A.enqueueAction(trngAction);
                // end of getting all Training__c records
                
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
        $A.enqueueAction(roomAction);
        // end of getting all Training_Room__c records
    },
    
    dateChanged : function(component, event, helper) {

        helper.changeEndDate(component, event, helper);
        
        // get and set trainer/cotrainer to invoke showTrainerToast indirectly 
        var trainer   = component.get("v.trainer");
        var cotrainer = component.get("v.cotrainer");
        component.set("v.trainer", trainer);
        component.set("v.cotrainer", cotrainer);
    }, 
    
    clearBatchFields : function(component, event, helper) {
        helper.clear(component, event);
    },
    
    findRooms : function(component, event, helper) {
        var loc      = component.get("v.location");
        var allRooms = component.get("v.roomList");
        var roomsForLocation = [];
        
        for (var i = 0; i < allRooms.length; i++) {
            // if room is associated with selected location...
            if (allRooms[i].TrainingLocation__c == loc) {
                // ...add to list
                roomsForLocation.push(allRooms[i]);
            }
        }
        component.set("v.roomsForLocation", roomsForLocation);
        
        // pass new location and associated rooms to application event
        var locEvent = $A.get("e.c:afNewBatchFormLocationEvent");
        locEvent.setParams({
            "location" : loc ,
            "roomsForLocation" : roomsForLocation
        });
        console.log('locEvent');
        locEvent.fire();
    },
    
    onSubmit : function(component, event, helper) {
        // in-built functionality to handle recordEditForm submission
        console.log('onSubmit');
        var form = component.find("newBatchForm");
        event.preventDefault();       // stop the form from submitting
        var fields = event.getParam('fields');
        component.find('newBatchForm').submit(fields);
    },
    
    onSuccess : function(component, event, helper) {
        console.log('onSuccess');
        var form = component.find("newBatchForm");
        var fields = event.getParam('fields');
        
        // records have been submitted, clear form
        helper.clear(component, event);  
        
        // display toast informing user of successful submission
        var toastEvent = $A.get("e.force:showToast");
        
        toastEvent.setParams({
            title : 'Success!',
            message: 'The new batch has been created.',
            duration: '2000',
            type: 'success',
        });
        toastEvent.fire();
    },
    
    selectRoom : function(component, event, helper) {
        var room    = component.get("v.room");
        var rooms   = component.get("v.roomsForLocation");
        
        for (var i = 0; i < rooms.length; i++) {
            if(rooms[i].Id == room) {
                room = rooms[i];
            }
        }
        // set to hidden inputField for form submission
        component.set("v.hiddenRoom", room.Id);
    },
    
    trackChanged : function(component, event, helper) {
        var track = component.get("v.track");
        
        // pass selected training track to application event
        var trackEvent = $A.get("e.c:afNewBatchFormTrackEvent");
        trackEvent.setParams({
            "track" : track
        });
        console.log('trackChanged');
        trackEvent.fire();  
    },
    
    trainerChanged : function(component, event, helper) {
        var trainings   = component.get("v.openTrainings");
        var trainer     = event.getParam("value");
        var startDate   = component.get("v.startDate");
        var endDate     = component.get("v.endDate");
        
        // pass appropriate values to helper function for display of toast
        helper.showTrainerToast(helper, event, trainings, trainer, startDate, endDate);
    },
})