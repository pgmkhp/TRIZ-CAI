// 定义全局变量
var projectname; // 项目名称
var description; // 问题描述
var member; // 项目成员
var imgdescription; // 图像描述
var startdate; // 开始日期
var enddate; // 结束日期

var curcomp = null; //当前选中组件

// 禁用右键菜单
document.oncontextmenu = function() {
    return false;
}

// 组件创建函数，接受一个组件的class，返回一个JQuery对象
function createComponent(classname) {
    var comp = $(document.createElement('div'));
    comp.addClass(classname);
    comp.addClass('component');
    comp.html('未命名');
    comp.appendTo($('.board'));

    // comp.draggable({containment:'parent'});
    jsPlumb.draggable(comp, {containment: "parent"});
    // jsPlumb.makeTarget(comp, {detachable:false});
    comp.dblclick(function() {
        curcomp = comp;
        $('#modifyModal').modal('toggle'); // 显示模态框
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
$('.linebtn').click(function() {
    jsPlumb.toggleDraggable($('.component'));
    jsPlumb.makeSource($('.component'), {detachable:false});
    jsPlumb.makeTarget($('.component'), {detachable:false});
    $(this).addClass('btn-primary');
});
$('#line1').click(function() {
});
jsPlumb.bind("connection", function(conn, originalEvent) {
    // $('.component').draggable("enable");
    jsPlumb.toggleDraggable($('.component'));
    // jsPlumb.draggable($('.component'));
    jsPlumb.unmakeEverySource();
    jsPlumb.unmakeEveryTarget();
    $('.linebtn').removeClass('btn-primary');
});
jsPlumb.bind("mousedown", function(conn, originalEvent) {
    if (originalEvent.which == 3) {
        jsPlumb.detach(conn);
    }      
});
jsPlumb.ready(function() { 
    jsPlumb.importDefaults({
        Anchor: "AutoDefault",
        Endpoint: ["Dot", {radius: 3}],
        DragOptions: {cursor: "crosshair" },
        Container: "board",
    });
    var line1 = jsPlumb.getInstance({
        PaintStyle: {stroke: "green", strokeWidth:3},
        // PaintStyle: {stroke: "green", strokeWidth:3, dashstyle: "5 2"},
        Overlays: [
            ["PlainArrow", {location: 1}],
            ["Label", {label: "未命名"}]
        ],
    });
});





// 存放图的数据结构
function Graph(v) {
    this.vertices = v;
    this.edges = 0;
    this.adj = [];
    for(var i =0; i<this.vertices; i++) {
        this.adj[i] = [];
        // this.adj[i].push('');
    }
    this.addEdge = addEdge;
    // this.toString = toString;
}
function addEdge(id1, id2) {
    this.adj[id1].push(id2);
    this.edges++;
}
