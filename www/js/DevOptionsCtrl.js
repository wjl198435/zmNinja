/* jshint -W041 */
/* jslint browser: true*/
/* global cordova,StatusBar,angular,console */

angular.module('zmApp.controllers').controller('zmApp.DevOptionsCtrl', ['$scope', '$rootScope', '$ionicModal', 'zm', 'NVRDataModel', '$ionicSideMenuDelegate', '$ionicPopup', '$http', '$q', '$ionicLoading', '$ionicHistory', '$state', 'SecuredPopups', '$translate', function ($scope, $rootScope, $ionicModal, zm, NVRDataModel, $ionicSideMenuDelegate, $ionicPopup, $http, $q, $ionicLoading, $ionicHistory, $state, SecuredPopups, $translate) {

  $scope.openMenu = function () {
    $ionicSideMenuDelegate.toggleLeft();
    // $scope.this.will.crash = 1;

  };

  //----------------------------------------------------------------
  // Alarm notification handling
  //----------------------------------------------------------------
  $scope.handleAlarms = function () {
    $rootScope.isAlarm = !$rootScope.isAlarm;
    if (!$rootScope.isAlarm) {
      $rootScope.alarmCount = "0";
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go("app.events", {
        "id": 0,
        "playEvent": false
      }, {
        reload: true
      });
      return;
    }
  };

  //----------------------------------------------------------------
  // Save anyway when you exit
  //----------------------------------------------------------------

  $scope.$on('$ionicView.beforeLeave', function () {
    saveDevOptions();

  });

  //-------------------------------------------------------------------------
  // Lets make sure we set screen dim properly as we enter
  // The problem is we enter other states before we leave previous states
  // from a callback perspective in ionic, so we really can't predictably
  // reset power state on exit as if it is called after we enter another
  // state, that effectively overwrites current view power management needs
  //------------------------------------------------------------------------
  $scope.$on('$ionicView.beforeEnter', function () {
    //console.log("**VIEW ** DevOptions Ctrl Entered");
    $scope.loginData = NVRDataModel.getLogin();
    console.log("DEV LOGS=" + $scope.loginData.enableLogs);

    $scope.isMultiPort = false;

    NVRDataModel.getZmsMultiPortSupport()
      .then(function (data) {
        $scope.isMultiPort = (data == 0) ? false : true;
        NVRDataModel.debug("Multiport report:" + $scope.isMultiPort);
      });


    NVRDataModel.setAwake(false);
  });

  $scope.isTzSupported = function () {
    return NVRDataModel.isTzSupported();
  };

  $scope.getTimeZoneNow = function () {
    return NVRDataModel.getTimeZoneNow();
  };

  $scope.checkMultiPortToggle = function () {
    //  if ($rootScope.platformOS == 'ios')
    //    $scope.loginData.disableSimulStreaming = true;
  };
  //------------------------------------------------------------------
  // Perform the login action when the user submits the login form
  //------------------------------------------------------------------

  function saveDevOptions() {
    NVRDataModel.debug("SaveDevOptions: called");

    if (parseInt($scope.loginData.cycleMonitorsInterval) < zm.minCycleTime) {
      $scope.loginData.cycleMonitorsInterval = zm.minCycleTime.toString();
    }
    if ((parseInt($scope.loginData.maxFPS) < 0) || (parseInt($scope.loginData.maxFPS) > zm.maxFPS)) {
      $scope.loginData.maxFPS = zm.defaultFPS.toString();
    }

    if (parseInt($scope.loginData.refreshSec) <= 0) {
      NVRDataModel.debug("SaveDevOptions: refresh sec was too low at " +
        $scope.loginData.refreshSec + " reset to 1");
      $scope.loginData.refreshSec = 1;

    }

    // make sure only ints are used as CSS classes only use ints
    // in grid scale
    $scope.loginData.montageResizeSteps = parseInt($scope.loginData.montageResizeSteps);

    if ($scope.loginData.montageResizeSteps < 1) {
      $scope.loginData.montageResizeSteps = 1;

    }

    if ($scope.loginData.montageResizeSteps > 50) {
      $scope.loginData.montageResizeSteps = 50;

    }

    if ((parseInt($scope.loginData.montageQuality) < zm.safeMontageLimit) ||
      (parseInt($scope.loginData.montageQuality) > 100)) {
      $scope.loginData.montageQuality = 100;
    }

    if ((parseInt($scope.loginData.singleImageQuality) < zm.safeImageQuality) ||
      (parseInt($scope.loginData.singleImageQuality) > 100)) {
      $scope.loginData.singleImageQuality = zm.safeImageQuality.toString();
    }


    NVRDataModel.debug("SaveDevOptions: Saving to disk");
    NVRDataModel.setLogin($scope.loginData);
    NVRDataModel.getMonitors(1);

  }

  $scope.saveDevOptions = function () {

    saveDevOptions();
    // $rootScope.zmPopup.close();
    $rootScope.zmPopup = SecuredPopups.show('alert', {
      title: $translate.instant('kSettingsSaved'),
      template: "{{'kExploreEnjoy' | translate }} {{$root.appName}}",
      okText: $translate.instant('kButtonOk'),
      cancelText: $translate.instant('kButtonCancel'),
    }).then(function (res) {
      $ionicSideMenuDelegate.toggleLeft();
    });

  };
  //------------------------------------------------------------------
  // controller main
  //------------------------------------------------------------------

}]);
