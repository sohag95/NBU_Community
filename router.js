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

//####################################
router.get('/test',userController.test)
//####################################
//user log-in 
router.post("/loggingIn",  userController.loggingIn)

// user related routes
router.get('/',userController.guestHomePage)
router.get('/log-in',userController.getLogInForm)
router.get('/sign-up-form',userController.getSignUpForm)

//verification related routers
router.get("/verification/:case/:regNumber/page",verificationController.checkVerifier,verificationController.checkStudentAccount,verificationController.getVerificationPage)
router.post("/verification/:case/:regNumber/accept",verificationController.checkVerifier,verificationController.checkStudentAccount,verificationController.accountVerified)
router.post("/verification/:case/:regNumber/reject",verificationController.checkVerifier,verificationController.checkStudentAccount,verificationController.accountReject)

//NBU Community / Society controller related router
router.get('/societyController-home',officialUserController.societyControllerMustBeLoggedIn,societyControllerController.societyControllerHome)

//Post controller related router
router.get('/postController-home',officialUserController.postControllerMustBeLoggedIn,postControllerController.postControllerHome)

//Video Editor related router
router.get('/videoEditor-home',officialUserController.videoEditorMustBeLoggedIn,videoEditorController.videoEditorHome)

//Student related router
router.post("/createNewAccount",multipleOperationController.checkAccountPosition,studentController.createNewAccount)
router.post("/setEmailId",studentController.studentMustBeLoggedIn,studentController.setEmailId)
router.get('/student-home',studentController.studentMustBeLoggedIn,studentController.getStudentHomePage)
router.get("/student/:regNumber/profile",userController.ifUserLoggedIn,studentController.ifProfileUserExists,studentController.getProfileOtherData,studentController.getProfilePage)

//Admin related routers
router.get('/admin-home',officialUserController.adminMustBeLoggedIn,adminController.adminHome)
router.post("/addDepartment",  officialUserController.adminMustBeLoggedIn,adminController.addDepartment)
router.post("/addNewGroup",  officialUserController.adminMustBeLoggedIn,adminController.addNewGroup)
router.post("/addNewSessionYear",  officialUserController.adminMustBeLoggedIn,adminController.addNewSessionYear)
router.post("/setPresentSessionYear",  officialUserController.adminMustBeLoggedIn,adminController.setPresentSessionYear)

//sessionBatch related routers
router.post("/addNewSessionBatch",  officialUserController.adminMustBeLoggedIn,sessionBatchController.createNewSessionBatch)
router.get("/batch/:batchId/details",userController.ifUserLoggedIn,sessionBatchController.isSessionBatchExists,sessionBatchController.getSessionBatchDetailsPage)

//department related routers
router.get("/department/:departmentCode/details",userController.ifUserLoggedIn,departmentController.isDepartmentExists,departmentController.getDepartmentDetailsPage)

//group related routers
router.get("/group/:groupId/details",userController.ifUserLoggedIn,groupController.isGroupExists,groupController.getGroupDetailsPage)

//Activity relater routers
//from=batch/department/group,id=batchId,departmentCode,groupId
router.get("/activity/:from/:id/create",studentController.studentMustBeLoggedIn,activityController.ifStudentPresentLeader,activityController.getActivityCreationPage)
router.post("/activity/:from/:id/create",studentController.studentMustBeLoggedIn,activityController.ifStudentPresentLeader,activityController.getExtraDataToCreateActivity,activityController.createNewActivity)
router.get("/activity/:id/details",userController.ifUserLoggedIn,activityController.ifActivityPresent,activityController.getActivityDetailsPage)
router.post("/activity/:id/edit",studentController.studentMustBeLoggedIn,activityController.ifActivityPresent,checkingController.checkActivityLeaderOrNot,activityController.editActivityDetails)

//voting related routers
router.post("/vote/:activityId/:id/topic",studentController.studentMustBeLoggedIn,votingController.ifVotingPoleExists,checkingController.checkTopicVoter,votingController.giveTopicVote)
router.post("/vote/:activityId/:id/declare-topic-result",studentController.studentMustBeLoggedIn,votingController.ifVotingPoleExists,checkingController.checkTopicVoteResultDeclarableOrNot,votingController.declareTopicResult)

//Logging out router
router.post("/loggingOut", userController.loggingOut)
//###################################

module.exports=router