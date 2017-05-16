// 定义全局变量
var projectname; // 项目名称
var description; // 问题描述
var member; // 项目成员
var imgdescription; // 图像描述
var startdate; // 开始日期
var enddate; // 结束日期

var curcomp = null; // 当前选中组件
var curline = null; // 当前选中线

// 线的样式
var line1 = {stroke: "green", strokeWidth:2};
var line2 = {stroke: "green", strokeWidth:2, dashstyle: "5 2"};
var line3 = {stroke: "red", strokeWidth:2};
var line4 = {stroke: "green", strokeWidth:6};

// 线、组件的数据结构
var line1data = new Graph();
var line2data = new Graph();
var line3data = new Graph();
var line4data = new Graph();

// 禁用右键菜单
document.oncontextmenu = function() {
    return false;
}

// 组件创建函数，接受一个组件的class
function createComponent(classname) {
    var comp = $(document.createElement('div'));
    comp.addClass(classname);
    comp.addClass('component');
    comp.html('未命名');
    comp.appendTo($('.board'));
    // 添加组件id
    var id = jsPlumbUtil.uuid();
    comp.attr('id', id);
    line1data.addVertex(id);

    jsPlumb.draggable(comp, {containment: "parent"});
    // 双击更改组件名称
    comp.dblclick(function() {
        curcomp = comp;
        $('#modifyModal').modal('toggle'); // 显示模态框
    });
    // 右键删除组件
    comp.bind('mousedown', function(even) {
        if (even.which == 3) {
            jsPlumb.remove(comp);
            line1data.delVertex(id);
        }
    });
}

// 修改名字
$('#renamebtn').click(function() {
    if (curcomp) {
        curcomp.html($('#newname').val());
        $('#newname').val('');
        $('#modifyModal').modal('toggle'); // 关闭模态框
        curcomp = null;
    }
});

jsPlumb.ready(function() { 
    jsPlumb.importDefaults({
        Anchor: "AutoDefault",
        Endpoint: ["Dot", {radius: 3}],
        DragOptions: {cursor: "crosshair" },
        Container: "board",
        ConnectionOverlays: [
            ["PlainArrow", {location: 1}],
            ["Label", {label: "未命名"}]
        ],
    });   
});

// 画板工具栏事件绑定
$('#component1').click(function() {
    createComponent('component1');
});
$('#component2').click(function() {
    createComponent('component2');
});
$('#component3').click(function() {
    createComponent('component3');
});
$('#line1').click(function() {
    jsPlumb.importDefaults({PaintStyle: line1});
});
$('#line2').click(function() {
    jsPlumb.importDefaults({PaintStyle: line2});
});
$('#line3').click(function() {
    jsPlumb.importDefaults({PaintStyle: line3});
});
$('#line4').click(function() {
    jsPlumb.importDefaults({PaintStyle: line4});
});
$('.linebtn').click(function() {
    jsPlumb.toggleDraggable($('.component'));
    jsPlumb.makeSource($('.component'), {detachable:false});
    jsPlumb.makeTarget($('.component'), {detachable:false});
    $(this).addClass('btn-primary');
});

// 连线事件
jsPlumb.bind("connection", function(conn, originalEvent) {
    jsPlumb.toggleDraggable($('.component'));
    jsPlumb.unmakeEverySource();
    jsPlumb.unmakeEveryTarget();
    $('.linebtn').removeClass('btn-primary');

    line1data.addEdge(conn.sourceId, conn.targetId);
});

// 鼠标右键连线，删除连线
jsPlumb.bind("mousedown", function(conn, originalEvent) {
    if (originalEvent.which == 3) {
        jsPlumb.detach(conn);

        line1data.delEdge(conn.sourceId, conn.targetId);
    }      
});






// 存放图的数据结构
function Graph() {
    this.vertices = 0;
    this.edges = 0;
    this.adj = [];
    
    this.addVertex = addVertex;
    this.delVertex = delVertex;
    this.addEdge = addEdge;
    this.delEdge = delEdge;
    this.getData = getData;
}
function addVertex(id) {
    this.vertices++;
    this.adj[id] = [];
}
function delVertex(id) {
    this.vertices--;
    this.edges -= this.adj[id].length;
    delete this.adj[id];
}
function addEdge(sid, tid) {
    this.adj[sid].push(tid);
    this.edges++;
}
function delEdge(sid, tid) {
    this.adj[sid].splice($.inArray(tid, this.adj[sid]),1);
    this.edges--;
}
function getData() {
    var data = [];
    for (var sid in this.adj) {
        for (var i=0; i<this.adj[sid].length; i++) {
            var tid = this.adj[sid][i];
            data.push([sid, tid]);
        }
    }
    return data;
}
