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
function step(n) {
    $('.content').hide();
    $('#step'+n).show();
    $('.sidebar li').removeClass('active');
    $('.sidebar li').eq(n-1).addClass('active');
}


// --------------------------------------
// |       问题分析部分                  |
// --------------------------------------

// 起止日期选择
$("#startdate").datepicker({
    changeMonth: true,
    dateFormat: "yy-mm-dd",
    monthNamesShort: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    onClose: function(selectedDate) {
        $("#enddate").datepicker("option", "minDate", selectedDate);
    }
});

$("#enddate").datepicker({
    changeMonth: true,
    dateFormat: "yy-mm-dd",
    monthNamesShort: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    onClose: function(selectedDate) {
        $("#startdate").datepicker("option", "maxDate", selectedDate);
        //$("#enddate").val($(this).val());
    }
});
// 起止日期选择结束
$('#save').click(function() {
    console.log('Button down');
    projectname = $('#projectname').val();
    description = $('#description').val();
    member = $('#member').val();
    startdate = $('#startdate').val();
    enddate = $('#enddate').val();
    imglist = $('#imgdescription').files;
    // imgdescription = URL.createObjectURL(imglist[0]);

    console.log(imglist);
    
});


// --------------------------------------
// |       系统分析部分                  |
// --------------------------------------

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
        $('#modifycom').modal('toggle'); // 显示模态框
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
$('#modifycom button:last').click(function() {
    if (curcomp) {
        curcomp.html($('#modifycom input').val());
        $('#modifycom input').val('');
        $('#modifycom').modal('toggle'); // 关闭模态框
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
    conn.connection.setLabel('未命名');
    jsPlumb.toggleDraggable($('.component'));
    jsPlumb.unmakeEverySource();
    jsPlumb.unmakeEveryTarget();
    $('.linebtn').removeClass('btn-primary');

    line1data.addEdge(conn.sourceId, conn.targetId);
});

// 鼠标双击连线，修改连线标题
jsPlumb.bind("dblclick", function(conn, originalEvent) {
    $('#modifyline').modal('toggle');
    curline = conn;
});
$('#modifyline button:last').click(function() {
    curline.setLabel($('#modifyline input').val());
    $('#modifyline input').val('');
    $('#modifyline').modal('toggle');
    curline = null;
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
    this.toString = toString;
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
function toString() {
    var data = this.getData();
    var list = [];
    for (var i=0; i<data.length; i++) {
        var s = $('#'+data[i][0]);
        var t = $('#'+data[i][1]);
        var line = jsPlumb.select({source:s, target:t});
        list.push([s.html(), t.html(), line.getLabel()]);
    }
    return list;
}


// --------------------------------------
// |       标准解部分                    |
// --------------------------------------

$('#demo').click(function () {
    var list1 = line1data.toString();
    for (var item in list1) {
        item[0]
    }
});
