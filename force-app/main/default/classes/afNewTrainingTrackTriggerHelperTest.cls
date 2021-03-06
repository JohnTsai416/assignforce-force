/**************************************************************
* afNewTrainingTrackTriggerHelper Test Class
* Author: Ian Blanchard
*
* Tests the NewTrainingTrack Trigger Helper class
* Ensures the trigger runs correctly for both a single record
* and a large number of records.
***************************************************************/ 


@isTest
public with sharing class afNewTrainingTrackTriggerHelperTest {

    @isTest
    public static void doTest() {

        /*****************
            SINGLE CASE
        *****************/

        Test.startTest();

        //Call the UtilityClass to create and insert training track
        // ApexTestUtilityClass.createNewTrainingTrack();
        Training_Track__c newTrack = UtilityMethods.createTrainingTrackData(1).get(0);
        insert newTrack;

        //Query to get the training track that was inserted back from the Org
        Training_Track__c result = [SELECT id, color__c FROM Training_Track__c LIMIT 1];

        //Check that the query was successful, the training track is not null
        System.assertNotEquals(result,null);

        //Check that the Color field has been filled
        System.assertNotEquals(result.Color__c,null);


        /***************
            BULK CASE
        ***************/

        //Create and insert 200 Training Tracks for testing
        List<Training_Track__c> newTracks = UtilityMethods.createTrainingTrackData(200);
        insert newTracks;

        //Query to get the training tracks back with the color fields
        //  that should have been set by the trigger
        List<Training_Track__c> results = [SELECT id,color__c FROM Training_Track__c];

        //Ensure the list is not null, and has 200 tracks in it
        System.assertNotEquals(results,null);
        System.assertEquals(results.size(),201);

        //Assert the color field for every track in the list is not null
        for(Training_Track__c t : results){
            System.assertNotEquals(t.color__c,null);
        }

        Test.stopTest();

    }
    
}