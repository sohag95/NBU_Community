const express=require('express')
const router=express.Router()
const userController=require('./controllers/userController')
const officialUserController=require('./controllers/officialUserController')
const adminController=require('./controllers/adminController')
const sessionBatchController=require('./controllers/sessionBatchController')
const departmentController=require('./controllers/departmentController')
const groupController=require('./controllers/groupController')
const studentController=require('./controllers/studentController')
const multipleOperationController=require('./controllers/multipleOperationController')
const societyControllerController=require('./controllers/societyControllerController')
const verificationController=require('./controllers/verificationController')
const postControllerController=require('./controllers/postControllerController')
const videoEditorController=require('./controllers/videoEditorController')
const activityController=require('./controllers/activityController')
const votingController=require('./controllers/votingController')
const checkingController=require('./controllers/checkingController')
const notificationController=require('./controllers/notificationController')
const reportController=require('./controllers/reportController')
const homeTutorController=require('./controllers/homeTutorController')
const campusGroupController=require('./controllers/campusGroupController')
const awsS3BucketController=require('./controllers/awsS3BucketController')
const forgotPasswordController=require('./controllers/forgotPasswordController')
      
const multer=require("multer")
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


//####################################
router.get('/test',userController.test)

//####################################
router.post("/photo-upload",upload.single('image'),awsS3BucketController.uploadPhoto)
//Fetch images from AWS bucket
//from=profile,cover,batch-banner,department-banner,group-banner,campusGroup-banner,activity-banner
//size=small,medium,large
//key=profile+regNumber,cover+regNumber,batchId,departmentCode,groupId,_id,_id
router.get('/image/:from/:size/:key',awsS3BucketController.getPhoto)

//####################################
//guest-user related routers
router.get('/',userController.guestHomePage)
router.get("/all-departments",  userController.allDepartments)

//checking data during sign up of an account
router.post("/doesEmailExists",userController.doesEmailExist)
router.post("/doesPhoneNumberExists",userController.doesPhoneNumberExist)

//Searching student by userName or regNumber 
router.post("/search-student",userController.searchStudent)

//Image upload related routers
router.post("/upload-profile-photo",upload.single('image'),userController.userMustBeLoggedIn,awsS3BucketController.uploadProfilePhoto)
router.post("/upload-cover-photo",upload.single('image'),studentController.studentMustBeLoggedIn,awsS3BucketController.uploadCoverPhoto)

//########################
//user related routes
router.get('/log-in',userController.getLogInForm)
router.post("/loggingIn",  userController.loggingIn)
router.get("/notifications",  userController.userMustBeLoggedIn,notificationController.getAllNotifications)
router.get('/sign-up-form',userController.getSignUpForm)
router.get('/forgot-password-form',forgotPasswordController.getForgotPasswordForm)
router.get('/reset-password-form/:email',userController.userMustNotLoggedIn,forgotPasswordController.getVerifiedDataByEmailId,forgotPasswordController.getResetPasswordForm)
router.post('/sent-new-otp',userController.userMustNotLoggedIn,forgotPasswordController.ifEmailIdRegistered,forgotPasswordController.sentNewOTP)
router.post('/reset-password-otp-received',userController.userMustNotLoggedIn,forgotPasswordController.goToResetPasswordForm)
router.post('/reset-password',userController.userMustNotLoggedIn,forgotPasswordController.ifEmailIdRegistered,forgotPasswordController.checkNewPasswordData,forgotPasswordController.checkOTPData,forgotPasswordController.setNewPassword)

//########################
//verification related routers
router.get("/verification/:case/:regNumber/page",userController.userMustBeLoggedIn,verificationController.checkVerifier,verificationController.checkStudentAccount,verificationController.getVerificationPage)
router.post("/verification/:case/:regNumber/accept",userController.userMustBeLoggedIn,verificationController.checkVerifier,verificationController.checkStudentAccount,verificationController.checkifAlreadyVerified,verificationController.accountVerified)
router.post("/verification/:case/:regNumber/reject",userController.userMustBeLoggedIn,verificationController.checkVerifier,verificationController.checkStudentAccount,verificationController.checkifAlreadyRejected,verificationController.accountReject)

//########################
//NBU Community / Society controller related router
router.get('/societyController-home',officialUserController.societyControllerMustBeLoggedIn,societyControllerController.societyControllerHome)
router.get('/user-verification-case1-page',officialUserController.societyControllerMustBeLoggedIn,societyControllerController.getVerifyCase1AccountPage)
router.get('/handle-reporting-page',officialUserController.societyControllerMustBeLoggedIn,societyControllerController.getHandleReportingPage)
router.get('/verify-user-account-page',officialUserController.societyControllerMustBeLoggedIn,societyControllerController.getVerifyUserAccountPage)
router.get('/society-handling-page',officialUserController.societyControllerMustBeLoggedIn,societyControllerController.getSocietyHandlingPage)
router.post("/report-resolved",officialUserController.societyControllerMustBeLoggedIn,reportController.reportResolved)

//########################
//Reporting related router
router.post("/sent-report",studentController.studentMustBeLoggedIn,reportController.checkReportType,reportController.checkIfAlreadyReported,reportController.sentReport)

//########################
//STUDENT related router
//unused router|router.post("/setEmailId",studentController.studentMustBeLoggedIn,studentController.setEmailId)
router.post("/createNewAccount",multipleOperationController.checkAccountPosition,studentController.createNewAccount)
router.get('/student-home',studentController.studentMustBeLoggedIn,studentController.getStudentHomePage)
router.get("/student/:regNumber/profile",userController.ifUserLoggedIn,studentController.ifProfileUserExists,studentController.getProfileOtherData,studentController.getProfilePage)
router.post("/update-bio-status/:regNumber",studentController.studentMustBeLoggedIn,studentController.ifProfileUserExists,studentController.ifUserProfileOwner,studentController.setBioStatus)
router.get("/profile-setting/:regNumber",studentController.studentMustBeLoggedIn,studentController.ifProfileUserExists,studentController.getProfileOtherData,studentController.ifUserProfileOwner,studentController.getProfileSettingPage)
router.get("/activities/student/:regNumber",userController.userMustBeLoggedIn,studentController.ifProfileUserExists,studentController.getProfileOtherData,studentController.getStudentActivitiesPage)
router.get("/voting-poles/student/:regNumber",userController.userMustBeLoggedIn,studentController.ifProfileUserExists,studentController.getProfileOtherData,studentController.getStudentVotingPolesPage)
router.get("/campus-group/student/:regNumber",userController.userMustBeLoggedIn,studentController.ifProfileUserExists,studentController.getProfileOtherData,studentController.getStudentCampusGroupPage)
router.post('/set-new-password',studentController.studentMustBeLoggedIn,studentController.checkPresentPassword,forgotPasswordController.checkNewPasswordData,studentController.resetNewPassword)
router.post('/on-profile-view-to-guest',studentController.studentMustBeLoggedIn,studentController.onProfileViewToGuest)
router.post('/off-profile-view-to-guest',studentController.studentMustBeLoggedIn,studentController.offProfileViewToGuest)


//########################
//ADMIN related routers
router.get('/admin-home',officialUserController.adminMustBeLoggedIn,adminController.adminHome) 
router.post("/setup-starting-data",  officialUserController.adminMustBeLoggedIn,adminController.setUpStartingData)
router.get('/add-new-session-batch',officialUserController.adminMustBeLoggedIn,adminController.addNewSessionBatchPage)
router.get('/handle-rejected-accounts',officialUserController.adminMustBeLoggedIn,adminController.getRejectedAccounts)
router.get('/add-department-and-create-group',officialUserController.adminMustBeLoggedIn,adminController.addDepartmentAndCreateGroup)
router.get('/handle-official-user-data',officialUserController.adminMustBeLoggedIn,adminController.handleOfficialUserData)
router.post("/addDepartment",  officialUserController.adminMustBeLoggedIn,adminController.addDepartment)
router.post("/addNewGroup",  officialUserController.adminMustBeLoggedIn,adminController.addNewGroup)
router.post("/addNewSessionBatch",  officialUserController.adminMustBeLoggedIn,sessionBatchController.createNewSessionBatch)
router.post("/addNewSessionYear",  officialUserController.adminMustBeLoggedIn,adminController.addNewSessionYear)
router.post("/setPresentSessionYear",  officialUserController.adminMustBeLoggedIn,adminController.setPresentSessionYear)
router.post("/delete/:regNumber/account",  officialUserController.adminMustBeLoggedIn,adminController.deleteAccount)

//########################
//-----SOURCE related routers----
router.get("/source/:from/:id/notifications",checkingController.ifSourcePresent,notificationController.getSourceNotifiations)
//here type=all to get particular data
router.get("/activities/:type/:from/:id",checkingController.ifSourcePresent,activityController.getSourceAllActivities)

//########################
//sessionBatch related routers
router.get("/batch/:batchId/details",userController.ifUserLoggedIn,sessionBatchController.isSessionBatchExists,sessionBatchController.getSessionBatchDetailsPage)
router.post("/upload-batch-banner/:batchId",upload.single('image'),studentController.studentMustBeLoggedIn,sessionBatchController.isSessionBatchExists,sessionBatchController.ifPresentBatchLeader,awsS3BucketController.uploadBatchBannerPhoto)

//########################
//department related routers
router.get("/department/:departmentCode/details",userController.ifUserLoggedIn,departmentController.isDepartmentExists,departmentController.getDepartmentDetailsPage)
router.get("/department/:departmentCode/previous-details",userController.ifUserLoggedIn,departmentController.isDepartmentExists,departmentController.getDepartmentPreviousDetailsPage)
router.post("/upload-department-banner/:departmentCode",upload.single('image'),studentController.studentMustBeLoggedIn,departmentController.isDepartmentExists,departmentController.ifPresentDepartmentLeader,awsS3BucketController.uploadDepartmentBannerPhoto)

//########################
//group related routers
router.get("/group/:groupId/details",userController.ifUserLoggedIn,groupController.isGroupExists,groupController.getGroupDetailsPage)
router.get("/group/:groupId/previous-details",userController.ifUserLoggedIn,groupController.isGroupExists,groupController.getGroupPreviousDetailsPage)
router.post("/upload-group-banner/:groupId",upload.single('image'),studentController.studentMustBeLoggedIn,groupController.isGroupExists,groupController.ifPresentGroupLeader,awsS3BucketController.uploadGroupBannerPhoto)

//########################
//Post controller related router
router.get('/postController-home',officialUserController.postControllerMustBeLoggedIn,postControllerController.postControllerHome)

//########################
//Video Editor related router
router.get('/videoEditor-home',officialUserController.videoEditorMustBeLoggedIn,videoEditorController.videoEditorHome)

//########################
//ACTIVITY RELATED ROUTERS
router.get("/all-activities",activityController.getAllActivitiesPage)
router.get("/top-activities",activityController.getTopActivitiesPage)
router.get("/todays-activities",activityController.getTodaysActivitiesPage)

//from=(batch/department/group) || id=(batchId/departmentCode/groupId)
router.get("/activity/:from/:sourceId/create",studentController.studentMustBeLoggedIn,activityController.ifStudentPresentLeader,activityController.getActivityCreationPage)
router.post("/activity/:from/:sourceId/create",studentController.studentMustBeLoggedIn,activityController.ifStudentPresentLeader,activityController.getExtraDataToCreateActivity,activityController.createNewActivity)
router.post("/activity/:id/delete",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,activityController.ifStudentActivityLeader,activityController.ifActivityDeleteable,activityController.deleteActivity)
router.get("/activity/:id/details",userController.ifUserLoggedIn,activityController.ifActivityPresent,activityController.getActivityDetailsPage)
router.post("/activity/:id/edit",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkActivityLeaderOrNot,activityController.editActivityDetails)
router.post("/activity/:id/submit",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkActivityLeaderOrNot,activityController.activitySubmitted)
router.get("/activity/:id/add-participants-page",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkActivityLeaderOrNot,activityController.getAllParticipantPage)
//postController related routers
router.post("/activity/:id/received",officialUserController.postControllerMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightPostControllerOrNot,activityController.activityReceivedByPostController)
router.get("/activity/:id/video-editor",officialUserController.postControllerMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightPostControllerOrNot,videoEditorController.getAvailableVideoEditors)
router.post("/assign/:id/video-editor",officialUserController.postControllerMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightPostControllerOrNot,activityController.assignVideoEditor)//should have middlewire as videoEditorController.ifEditorExists=with regNumber and is user videoEditor
router.post("/activity/:id/publish",officialUserController.postControllerMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightPostControllerOrNot,activityController.publishActivity)
router.post("/activity/:id/upload-cover-photo",upload.single('image'),officialUserController.postControllerMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightPostControllerOrNot,awsS3BucketController.uploadActivityCoverPhoto)
//videoEditor related routers
router.post("/accept/:id/video-editing",officialUserController.videoEditorMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightVideoEditorOrNot,activityController.acceptVideoEditingByEditor)
router.post("/video-editing/:id/completed",officialUserController.videoEditorMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightVideoEditorOrNot,activityController.videoEditingCompletedByEditor)
//activity topic voting related routers
router.post("/vote/:activityId/:id/topic",studentController.studentMustBeLoggedIn,votingController.ifVotingPoleExists,checkingController.checkTopicVoter,votingController.giveTopicVote)
router.post("/vote/:activityId/:id/declare-topic-result",studentController.studentMustBeLoggedIn,votingController.ifVotingPoleExists,checkingController.checkTopicVoteResultDeclarableOrNot,votingController.declareTopicResult)
router.get("/topic-voting/:id/details",userController.ifUserLoggedIn,votingController.ifVotingPoleExists,votingController.topicVotingDetailsPage)
//like,dislike,comment on activity routers
router.post("/activity/:id/like",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,checkingController.ifActivityAlreadyLiked,activityController.likeActivity)
router.post("/activity/:id/dislike",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,checkingController.ifActivityAlreadyLiked,activityController.dislikeActivity)
router.post("/activity/:id/comment",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,activityController.commentOnActivity)

//########################
//Leader selection voting routers
router.post("/create/:from/:id/leader-voting-pole",studentController.studentMustBeLoggedIn,checkingController.ifSourcePresent,checkingController.ifCreatorLeader,checkingController.ifMoreThenFixedDaysOfLeaderSelection,votingController.createLeaderVotingPole)
router.get("/leader-voting/:id/details",userController.ifUserLoggedIn,votingController.ifVotingPoleExists,votingController.getLeaderVotingStatusAndCheckData,votingController.getLeaderVotingPage)
router.post("/leader-voting/:id/nomination",userController.ifUserLoggedIn,votingController.ifVotingPoleExists,votingController.getLeaderVotingStatusAndCheckData,checkingController.ifUserNominateable,votingController.addNameOnNomination)
router.post("/leader-voting/:id/give-vote",studentController.studentMustBeLoggedIn,userController.ifUserLoggedIn,votingController.ifVotingPoleExists,votingController.getLeaderVotingStatusAndCheckData,checkingController.checkLeaderVotingData,votingController.giveLeaderVote)
router.post("/leader-voting/:id/declare-result-by-leader",studentController.studentMustBeLoggedIn,votingController.ifVotingPoleExists,checkingController.ifVotingResultDeclarable,votingController.declareLeaderResultByLeader)
router.post("/leader-voting/:id/accept-as-leader",studentController.studentMustBeLoggedIn,votingController.ifVotingPoleExists,checkingController.newLeaderAcceptableOrNot,votingController.acceptSelfAsLeader)
router.get("/nominee/:regNumber/details",userController.ifUserLoggedIn,studentController.ifProfileUserExists,studentController.getProfileOtherData,votingController.getNomineeDetails)

//########################
//Home tuition related routers
router.get("/tutor/:regNumber/details",userController.ifUserLoggedIn,homeTutorController.checkIfHomeTutorPresent,homeTutorController.getHomeTutorDetailsPage)
router.post("/enroll-as-home-tutor",studentController.studentMustBeLoggedIn,homeTutorController.checkIfAlreadyEnrolled,homeTutorController.enrollAsHomeTutor)
router.post("/stop-as-home-tutor",studentController.studentMustBeLoggedIn,homeTutorController.checkIfHomeTutorEnrolled,homeTutorController.stopAsHomeTutor)
router.post("/start-as-home-tutor",studentController.studentMustBeLoggedIn,homeTutorController.checkIfHomeTutorEnrolled,homeTutorController.startAsHomeTutor)
router.post("/update-about-self",studentController.studentMustBeLoggedIn,homeTutorController.checkIfHomeTutorEnrolled,homeTutorController.updateAboutSelfInfo)
router.get("/edit-tutor-personal-info",studentController.studentMustBeLoggedIn,homeTutorController.checkIfHomeTutorEnrolled,homeTutorController.getTutorParsonalInfoEditPage)
router.post("/update-tutor-personal-info",studentController.studentMustBeLoggedIn,homeTutorController.checkIfHomeTutorEnrolled,homeTutorController.updateTutorParsonalInfo)
router.get("/search-home-tutor",userController.ifUserLoggedIn,homeTutorController.getTutorSearchPage)
router.post("/search-home-tutor",homeTutorController.searchHomeTutor)

//########################
//Campus groups related routers
router.get("/campus-groups",campusGroupController.campusGroups)
router.get("/create-campus-group-form",studentController.studentMustBeLoggedIn,campusGroupController.campusGroupCreationForm)
router.post("/create-campus-group",studentController.studentMustBeLoggedIn,campusGroupController.checkIfUserExitGroupLimit,campusGroupController.createCampusGroup)
router.get("/campus-groups/type/:groupType",userController.ifUserLoggedIn,campusGroupController.ifValidCampusGroupType,campusGroupController.allSameTypeGroupsPage)
router.get("/campus-groups/type/:groupType/:status",userController.ifUserLoggedIn,campusGroupController.ifValidCampusGroupType,campusGroupController.ifValidStatus,campusGroupController.allGroupsInSameStatusPage)
router.get("/campus-group/:id/details",userController.ifUserLoggedIn,campusGroupController.ifCampusGroupExists,campusGroupController.campusGroupDetails)
router.post("/campus-group/:id/set-individual-aim",studentController.studentMustBeLoggedIn,campusGroupController.ifCampusGroupExists,campusGroupController.ifCampusGroupMember,campusGroupController.setIndividualAim)
router.post("/campus-group/:id/set-group-aim",studentController.studentMustBeLoggedIn,campusGroupController.ifCampusGroupExists,campusGroupController.checkIfUserAdmin,campusGroupController.setCampusGroupAim)
router.post("/campus-group/:id/sent-membership-request",studentController.studentMustBeLoggedIn,campusGroupController.ifCampusGroupExists,campusGroupController.checkIfUserExitGroupLimit,campusGroupController.ifGroupMemberFull,campusGroupController.checkIfUserAlreadyMemberOrSentRequest,campusGroupController.sentMembershipRequest)
router.post("/campus-group/:id/accept-membership-request",studentController.studentMustBeLoggedIn,campusGroupController.ifCampusGroupExists,campusGroupController.checkIfUserAdmin,campusGroupController.ifRequestSent,campusGroupController.ifGroupMemberFull,campusGroupController.acceptMembershipRequest)
router.post("/campus-group/:id/reject-membership-request",studentController.studentMustBeLoggedIn,campusGroupController.ifCampusGroupExists,campusGroupController.checkIfUserAdmin,campusGroupController.ifRequestSent,campusGroupController.rejectMembershipRequest)
router.post("/campus-group/:id/add-admin",studentController.studentMustBeLoggedIn,campusGroupController.ifCampusGroupExists,campusGroupController.checkIfUserGroupCreator,campusGroupController.checkIfAlreadyAdminOrMemberOrNot,campusGroupController.addNewAdmin)
router.post("/campus-group/:id/leave-group",studentController.studentMustBeLoggedIn,campusGroupController.ifCampusGroupExists,campusGroupController.checkIfCreatorMemberAndAdminOrNot,campusGroupController.leaveCampusGroup)
router.post("/campus-group/:id/change-expected-members",studentController.studentMustBeLoggedIn,campusGroupController.ifCampusGroupExists,campusGroupController.checkIfUserAdmin,campusGroupController.checkNewExpectedMemberValue,campusGroupController.updateMemberValue)
router.post("/campus-group/:id/upload-banner",upload.single('image'),studentController.studentMustBeLoggedIn,campusGroupController.ifCampusGroupExists,campusGroupController.checkIfUserAdmin,awsS3BucketController.uploadCampusGroupBannerPhoto)
//--------------------------------
router.post("/campus-group/:id/delete-group",studentController.studentMustBeLoggedIn,campusGroupController.ifCampusGroupExists,campusGroupController.checkIfUserGroupCreator,campusGroupController.checkIfGroupDeletable,campusGroupController.deleteCampusGroup)

//###################################
//Logging out router
router.post("/loggingOut", userController.loggingOut)

//###################################
module.exports=router