(function () {
    angular
        .module('FileExplorerApp', [])
        .service('fileExplorerSDK', [fileExplorerSDK])
        .controller('fileExplorerCtrl', ['fileExplorerSDK', fileExplorerCtrl]);

    function fileExplorerCtrl(feSDK) {
        var fe = this;
        var initDS = function () {
            fe.dirUIDS.dirIdArr = feSDK.curDir.contents;
            for (var i = 0; i < feSDK.curDir.contents.length; i++) {
                if (!fe.dirUIDS.content.hasOwnProperty(feSDK.curDir.contents[i])) {
                    fe.dirUIDS.content[feSDK.curDir.contents[i]] = feSDK.dirRepo[feSDK.curDir.contents[i]].details;
                }
            }
            fe.dirUIDS.tracePath = feSDK.curDir.details.tracePath;
        };
        var resetScreen = function (obj) {
            feSDK.curDir = obj;
            initDS();
        };
        var validateName = function () {
            for (var i = 0; i < feSDK.curDir.contents.length; i++) {
                if (fe.dirName === feSDK.dirRepo[feSDK.curDir.contents[i]].details.name) {
                    return false;
                }
            }
            return true;
        };
        fe.dirName = '';
        fe.dirUIDS = {
            dirIdArr: [],
            content: {},
            tracePath: '',
            showModalError: false
        };
        fe.onNameInputChange = function () {
            fe.dirUIDS.showModalError = !validateName();
        };
        fe.closeModal = function () {
            fe.dirName = '';
            fe.dirUIDS.showModalError = false;
            $('#folderName').modal('hide');
        };
        fe.createDir = function () {
            feSDK.initDir(fe.dirName);
            initDS();
            fe.closeModal();
        };
        fe.changeDir = function (dir) {
            feSDK.feStack.push({
                id: dir.dirId,
                name: dir.name
            });
            resetScreen(feSDK.dirRepo[dir.dirId]);
        };
        fe.goBack = function () {
            feSDK.feStack.pop();
            resetScreen(feSDK.dirRepo[feSDK.curDir.details.parDirId]);
        };
        initDS();
    }

    function fileExplorerSDK() {
        var scope = this;
        var getDirDS = function (name) {
            var joinValue = function (arrObj) {
                var returnStr = '';
                for (var i = 0; i < arrObj.length; i++) {
                    returnStr += '/' + arrObj[i].name;
                }
                return returnStr;
            };
            this.details = {
                name: name,
                parDirId: (scope.feStack.length ? scope.feStack[scope.feStack.length - 1].id : '-1'),
                dirId: (name !== 'root' ? (new Date().getTime()) : '-1'),
                tracePath: (name === 'root') ? '/' : (joinValue(scope.feStack) + '/' + name)
            };
            // contains arr of ids
            this.contents = [];
        };
        var updateDirRepo = function (newDir) {
            if (!scope.dirRepo.hasOwnProperty(newDir.details.dirId)) {
                scope.dirRepo[newDir.details.dirId] = newDir;
                scope.dirRepo[newDir.details.parDirId].contents.push(newDir.details.dirId);
            }
        };
        this.feStack = [];
        this.dirRepo = {
            '-1': new getDirDS('root')
        };
        this.curDir = this.dirRepo[-1];
        this.initDir = function (name) {
            var newDir = new getDirDS(name);
            updateDirRepo(newDir);
        }
    }
})();