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

//####################################
router.get('/test',userController.test)
//####################################
//user log-in 
router.post("/loggingIn",  userController.loggingIn)
router.get("/notifications",  userController.userMustBeLoggedIn,notificationController.getAllNotifications)
router.get("/recent-activities",  userController.recentActivities)
router.get("/all-departments",  userController.allDepartments)

//Searching student by userName or regNumber 
router.post("/search-student",userController.searchStudent)
//user related routes
router.get('/',userController.guestHomePage)
router.get('/log-in',userController.getLogInForm)
router.get('/sign-up-form',userController.getSignUpForm)

//verification related routers
router.get("/verification/:case/:regNumber/page",verificationController.checkVerifier,verificationController.checkStudentAccount,verificationController.getVerificationPage)
router.post("/verification/:case/:regNumber/accept",verificationController.checkVerifier,verificationController.checkStudentAccount,verificationController.accountVerified)
router.post("/verification/:case/:regNumber/reject",verificationController.checkVerifier,verificationController.checkStudentAccount,verificationController.accountReject)

//NBU Community / Society controller related router
router.get('/societyController-home',officialUserController.societyControllerMustBeLoggedIn,societyControllerController.societyControllerHome)

//Student related router
router.post("/createNewAccount",multipleOperationController.checkAccountPosition,studentController.createNewAccount)
router.post("/setEmailId",studentController.studentMustBeLoggedIn,studentController.setEmailId)
router.get('/student-home',studentController.studentMustBeLoggedIn,studentController.getStudentHomePage)
router.get("/student/:regNumber/profile",userController.ifUserLoggedIn,studentController.ifProfileUserExists,studentController.getProfileOtherData,studentController.getProfilePage)

//Admin related routers
router.get('/admin-home',officialUserController.adminMustBeLoggedIn,adminController.adminHome)
router.post("/addDepartment",  officialUserController.adminMustBeLoggedIn,adminController.addDepartment)
router.post("/addNewGroup",  officialUserController.adminMustBeLoggedIn,adminController.addNewGroup)
router.post("/addNewSessionBatch",  officialUserController.adminMustBeLoggedIn,sessionBatchController.createNewSessionBatch)
router.post("/addNewSessionYear",  officialUserController.adminMustBeLoggedIn,adminController.addNewSessionYear)
router.post("/setPresentSessionYear",  officialUserController.adminMustBeLoggedIn,adminController.setPresentSessionYear)

//sessionBatch related routers
router.get("/batch/:batchId/details",userController.ifUserLoggedIn,sessionBatchController.isSessionBatchExists,sessionBatchController.getSessionBatchDetailsPage)

//department related routers
router.get("/department/:departmentCode/details",userController.ifUserLoggedIn,departmentController.isDepartmentExists,departmentController.getDepartmentDetailsPage)
router.get("/department/:departmentCode/previous-details",userController.ifUserLoggedIn,departmentController.isDepartmentExists,departmentController.getDepartmentPreviousDetailsPage)

//group related routers
router.get("/group/:groupId/details",userController.ifUserLoggedIn,groupController.isGroupExists,groupController.getGroupDetailsPage)
router.get("/group/:groupId/previous-details",userController.ifUserLoggedIn,groupController.isGroupExists,groupController.getGroupPreviousDetailsPage)

//Post controller related router
router.get('/postController-home',officialUserController.postControllerMustBeLoggedIn,postControllerController.postControllerHome)

//Video Editor related router
router.get('/videoEditor-home',officialUserController.videoEditorMustBeLoggedIn,videoEditorController.videoEditorHome)

//########################
//ACTIVITY RELATED ROUTERS
//------------------------
//from=(batch/department/group) || id=(batchId/departmentCode/groupId)
router.get("/activity/:from/:id/create",studentController.studentMustBeLoggedIn,activityController.ifStudentPresentLeader,activityController.getActivityCreationPage)
router.post("/activity/:from/:id/create",studentController.studentMustBeLoggedIn,activityController.ifStudentPresentLeader,activityController.getExtraDataToCreateActivity,activityController.createNewActivity)
router.get("/activity/:id/details",userController.ifUserLoggedIn,activityController.ifActivityPresent,activityController.getActivityDetailsPage)
router.post("/activity/:id/edit",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkActivityLeaderOrNot,activityController.editActivityDetails)
router.post("/activity/:id/submit",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkActivityLeaderOrNot,activityController.activitySubmitted)
router.get("/activity/:id/add-participants-page",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkActivityLeaderOrNot,activityController.getAllParticipantPage)
//postController related routers
router.post("/activity/:id/received",officialUserController.postControllerMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightPostControllerOrNot,activityController.activityReceivedByPostController)
router.get("/activity/:id/video-editor",officialUserController.postControllerMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightPostControllerOrNot,videoEditorController.getAvailableVideoEditors)
router.post("/assign/:id/video-editor",officialUserController.postControllerMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightPostControllerOrNot,activityController.assignVideoEditor)//should have middlewire as videoEditorController.ifEditorExists=with regNumber and is user videoEditor
router.post("/activity/:id/publish",officialUserController.postControllerMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightPostControllerOrNot,activityController.publishActivity)
router.post("/activity/:id/upload-cover-photo",officialUserController.postControllerMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightPostControllerOrNot,activityController.uploadVideoCoverPhoto)
//videoEditor related routers
router.post("/accept/:id/video-editing",officialUserController.videoEditorMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightVideoEditorOrNot,activityController.acceptVideoEditingByEditor)
router.post("/video-editing/:id/completed",officialUserController.videoEditorMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkRightVideoEditorOrNot,activityController.videoEditingCompletedByEditor)
//activity topic voting related routers
router.post("/vote/:activityId/:id/topic",studentController.studentMustBeLoggedIn,votingController.ifVotingPoleExists,checkingController.checkTopicVoter,votingController.giveTopicVote)
router.post("/vote/:activityId/:id/declare-topic-result",studentController.studentMustBeLoggedIn,votingController.ifVotingPoleExists,checkingController.checkTopicVoteResultDeclarableOrNot,votingController.declareTopicResult)
router.get("/vote/:id/details",userController.ifUserLoggedIn,votingController.ifVotingPoleExists,votingController.votingDetailsPage)
//like,dislike,comment routers
router.post("/activity/:id/like",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,checkingController.ifActivityAlreadyLiked,activityController.likeActivity)
router.post("/activity/:id/dislike",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,checkingController.ifActivityAlreadyLiked,activityController.dislikeActivity)
router.post("/activity/:id/comment",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,activityController.commentOnActivity)

//########################
//Leader selection voting routers
router.post("/create/:from/:id/leader-voting-pole",studentController.studentMustBeLoggedIn,checkingController.ifSourcePresent,checkingController.ifCreatorLeader,checkingController.ifMoreThen15DaysOfLeaderSelection,votingController.createLeaderVotingPole)
router.get("/leader-voting/:id/details",userController.ifUserLoggedIn,votingController.ifVotingPoleExists,votingController.getLeaderVotingStatusAndCheckData,votingController.getLeaderVotingPage)
router.post("/leader-voting/:id/nomination",userController.ifUserLoggedIn,votingController.ifVotingPoleExists,votingController.getLeaderVotingStatusAndCheckData,checkingController.ifUserNominateable,votingController.addNameOnNomination)
router.post("/leader-voting/:id/give-vote",studentController.studentMustBeLoggedIn,userController.ifUserLoggedIn,votingController.ifVotingPoleExists,votingController.getLeaderVotingStatusAndCheckData,checkingController.checkLeaderVotingData,votingController.giveLeaderVote)
router.post("/leader-voting/:id/declare-result-by-leader",studentController.studentMustBeLoggedIn,votingController.ifVotingPoleExists,checkingController.ifVotingResultDeclarable,votingController.declareLeaderResultByLeader)
router.post("/leader-voting/:id/accept-as-leader",studentController.studentMustBeLoggedIn,votingController.ifVotingPoleExists,checkingController.newLeaderAcceptableOrNot,votingController.acceptSelfAsLeader)

//Logging out router
router.post("/loggingOut", userController.loggingOut)
//###################################

module.exports=router