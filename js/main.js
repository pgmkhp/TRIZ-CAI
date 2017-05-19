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
    var plist = line1data.toString();
    for (var i=0; i<plist.length; i++) {
        var html = '<tr><td>不足</td><td>'+plist[i][0]+'</td><td>'+plist[i][2][0][0]+'</td><td>'+plist[i][1]+'</td><td></td></tr>';
        $('#top table').append(html);
    }
});
// var data1;
// $.getJSON("data1.json", function(data) {
//     data1 = data;  
// }); 



// 数据部分

var data1 = [
    {
        'id': 1,
        'text': '1.物质——场建立与破坏',
        'children': [
            {
                'id': 11,
                'text': '1.1.建立物质——场模型',
                'children': [
                    {
                        'id': 111,
                        'text': '1.1.1.完善一个不完整的物质——场模型',
                    },
                    {
                        'id': 112,
                        'text': '1.1.2.向内部复杂物质——场跃迁',
                    },
                    {
                        'id': 113,
                        'text': '1.1.3.向外部复杂物质——场跃迁',
                    },
                    {
                        'id': 114,
                        'text': '1.1.4.向环境复杂物质——场跃迁',
                    },
                    {
                        'id': 115,
                        'text': '1.1.5.通过改变环境向环境物质——场跃迁',
                    },
                    {
                        'id': 116,
                        'text': '1.1.6.向具有物质最小作用的物质——场跃迁',
                    },
                    {
                        'id': 117,
                        'text': '1.1.7.向具有施加于物质最大作用的物质——场跃迁',
                    },
                    {
                        'id': 118,
                        'text': '1.1.8.引入保护性物质',
                    },
                ],
            },
            {
                'id': 12,
                'text': '1.2.物质——场模型的破坏，消除或抵消系统内的有害作用',
                'children': [
                    {
                        'id': 121,
                        'text': '1.2.1.通过引入外部物质消除有害关系',
                    },
                    {
                        'id': 122,
                        'text': '1.2.2.通过改变现有物质来消除有害关系',
                    },
                    {
                        'id': 123,
                        'text': '1.2.3.通过消除场的有害作用消除有害关系',
                    },
                    {
                        'id': 124,
                        'text': '1.2.4.采用场抵消有害关系',
                    },
                    {
                        'id': 125,
                        'text': '1.2.5.采用场来“关闭”磁力键',
                    },
                ],
            },
        ],
    },
    {
        'id': 2,
        'text': '2.增加柔性和移动性',
        'children': [
            {
                'id': 21,
                'text': '2.1.转化成复杂的物质——场模型',
                'children': [
                    {
                        'id': 211,
                        'text': '2.1.1.向链式物质——场跃迁的常规形式',
                    },
                    {
                        'id': 212,
                        'text': '2.1.2.向双物质——场跃迁',
                    },
                ],
            },
            {
                'id': 22,
                'text': '2.2.增强物质——场模型',
                'children': [
                    {
                        'id': 221,
                        'text': '2.2.1.向具有可控场的物质——场跃迁',
                    },
                    {
                        'id': 222,
                        'text': '2.2.2.向带有工具分散物质——场跃迁',
                    },
                    {
                        'id': 223,
                        'text': '2.2.3.向具有毛细管多孔物质的物质——场跃迁',
                    },
                    {
                        'id': 224,
                        'text': '2.2.4.向动态化物质——场跃迁',
                    },
                    {
                        'id': 225,
                        'text': '2.2.5.采用结构化的场向物质——场跃迁',
                    },
                    {
                        'id': 226,
                        'text': '2.2.6.向结构物质——场跃迁',
                    },
                ],
            },
            {
                'id': 23,
                'text': '2.3.频率的协调',
                'children': [
                    {
                        'id': 231,
                        'text': '2.3.1.向具有作用匹配频率和产品固有频率的物质——场跃迁',
                    },
                    {
                        'id': 232,
                        'text': '2.3.2.向有作用和匹配频率的物质——场跃迁',
                    },
                    {
                        'id': 233,
                        'text': '2.3.3.向具有合并作用物质——场跃迁',
                    },
                ],
            },
            {
                'id': 24,
                'text': '2.4.利用磁场和铁磁材料',
                'children': [
                    {
                        'id': 241,
                        'text': '2.4.1.向原铁磁场跃迁',
                    },
                    {
                        'id': 242,
                        'text': '2.4.2.向铁磁场跃迁',
                    },
                    {
                        'id': 243,
                        'text': '2.4.3.从低效铁磁场向基于铁磁流体铁磁场跃迁',
                    },
                    {
                        'id': 244,
                        'text': '2.4.4.向基于磁性多孔结构的铁磁场跃迁',
                    },
                    {
                        'id': 245,
                        'text': '2.4.5.向在S1和/或S2中引入添加物的外部复杂铁磁场跃迁',
                    },
                    {
                        'id': 246,
                        'text': '2.4.6.向环境中铁磁场跃迁',
                    },
                    {
                        'id': 247,
                        'text': '2.4.7.向使用物理效应的铁磁场跃迁',
                    },
                    {
                        'id': 248,
                        'text': '2.4.8.向动态化铁磁场跃迁',
                    },
                    {
                        'id': 249,
                        'text': '2.4.9.向有结构化场的铁磁场跃迁',
                    },
                    {
                        'id': 2410,
                        'text': '2.4.10.向节律匹配的铁磁场跃迁',
                    },
                    {
                        'id': 2411,
                        'text': '2.4.11.向电磁场跃迁',
                    },
                    {
                        'id': 2412,
                        'text': '2.4.12.向采用电流变液体的电磁场跃迁',
                    },
                ],
            },
        ],
    },
    {
        'id': 3,
        'text': '3.向超系统和微观级跃迁',
        'children': [
            {
                'id': 31,
                'text': '3.1.转化成双系统或者多系统',
                'children': [
                    {
                        'id': 311,
                        'text': '3.1.1.将多个技术系统并入一个超系统',
                    },
                    {
                        'id': 312,
                        'text': '3.1.2.改变双系统或者多系统之间的连接',
                    },
                    {
                        'id': 313,
                        'text': '3.1.3.由相同元件向具有改变特征元件的跃迁',
                    },
                    {
                        'id': 314,
                        'text': '3.1.4.由多系统向单系统的螺旋进化',
                    },
                    {
                        'id': 315,
                        'text': '3.1.5.系统及其元件之间的不兼容特性分布',
                    },
                ],
            },
            {
                'id': 32,
                'text': '3.2.向微观级进化',
                'children': [
                    {
                        'id': 321,
                        'text': '3.2.1.引入“聪明”物质来实现向微观级的跃迁',
                    },
                ],
            },
        ],
    },
    {
        'id': 4,
        'text': '4.检测与测量',
        'children': [
            {
                'id': 41,
                'text': '4.1.间接方法',
                'children': [
                    {
                        'id': 411,
                        'text': '4.1.1.采用变化问题替代检测和测量问题',
                    },
                    {
                        'id': 412,
                        'text': '4.1.2.测量系统的复制品或者图像',
                    },
                    {
                        'id': 413,
                        'text': '4.1.3.测量对象变化的连续检测',
                    },
                ],
            },
            {
                'id': 42,
                'text': '4.2.建立新的测量系统，将一些物质或场，加入已有的系统中',
                'children': [
                    {
                        'id': 421,
                        'text': '4.2.1.测量物质——场的合成',
                    },
                    {
                        'id': 422,
                        'text': '4.2.2.引入易检测添加物实现向内部复杂物质——场的跃迁',
                    },
                    {
                        'id': 423,
                        'text': '4.2.3.引入到环境中的添加物可控制受测对象状态的变化',
                    },
                    {
                        'id': 424,
                        'text': '4.2.4.环境中产生的添加物可控制受控物体状态的变化',
                    },
                ],
            },
            {
                'id': 43,
                'text': '4.3.增强测量系统',
                'children': [
                    {
                        'id': 431,
                        'text': '4.3.1.通过采用物理效应强制测量物质——场',
                    },
                    {
                        'id': 432,
                        'text': '4.3.2.受控物体的共振应用',
                    },
                    {
                        'id': 433,
                        'text': '4.3.3.附带物体共振的应用',
                    },
                ],
            },
            {
                'id': 44,
                'text': '4.4.测量铁磁场',
                'children': [
                    {
                        'id': 441,
                        'text': '4.4.1.向测量原铁磁场跃迁',
                    },
                    {
                        'id': 442,
                        'text': '4.4.2.向测量铁磁场跃迁',
                    },
                    {
                        'id': 443,
                        'text': '4.4.3.若标准法54不可能，建立一复合系统，添加铁磁粒子附加物到系统中去',
                    },
                    {
                        'id': 444,
                        'text': '4.4.4.通过在环境中引入铁粒子向测量铁磁场跃迁',
                    },
                    {
                        'id': 445,
                        'text': '4.4.5.物理科学原理的应用',
                    },
                ],
            },
            {
                'id': 45,
                'text': '4.5.测量系统的进化趋势',
                'children': [
                    {
                        'id': 451,
                        'text': '4.5.1.向双系统和多系统跃迁',
                    },
                    {
                        'id': 452,
                        'text': '4.5.2.向测量派生物跃迁',
                    },
                ],
            },
        ],
    },
    {
        'id': 5,
        'text': '5.引入物质或场的标准解法',
        'children': [
            {
                'id': 51,
                'text': '5.1.引入物质',
                'children': [
                    {
                        'id': 511,
                        'text': '5.1.1.将空腔引入S1或S2，以改进物质——场元件的相互作用',
                    },
                    {
                        'id': 512,
                        'text': '5.1.2.将产品分成相互作用的若干部分',
                    },
                    {
                        'id': 513,
                        'text': '5.1.3.引入的物质使物质——场的相互作用正常并自行消除',
                    },
                    {
                        'id': 514,
                        'text': '5.1.4.用膨胀结构和泡沫使物质——场的相互作用正常化',
                    },
                ],
            },
            {
                'id': 52,
                'text': '5.2.引入场',
                'children': [
                    {
                        'id': 521,
                        'text': '5.2.1.使用技术系统中现有的场不会使系统复杂化',
                    },
                    {
                        'id': 522,
                        'text': '5.2.2.使用环境中的场',
                    },
                    {
                        'id': 523,
                        'text': '5.2.3.使用技术系统中现有物质的备用性能作为场资源',
                    },
                ],
            },
            {
                'id': 53,
                'text': '5.3.相变',
                'children': [
                    {
                        'id': 531,
                        'text': '5.3.1.改变物质的相态',
                    },
                    {
                        'id': 532,
                        'text': '5.3.2.两种相态相互转换',
                    },
                    {
                        'id': 533,
                        'text': '5.3.3.将一种相态转换成另一种相态，并利用伴随相转移的现象',
                    },
                    {
                        'id': 534,
                        'text': '5.3.4.转换到物质的双相态',
                    },
                    {
                        'id': 535,
                        'text': '5.3.5.利用系统部件之间的交互作用',
                    },
                ],
            },
            {
                'id': 54,
                'text': '5.4.运用自然现象',
                'children': [
                    {
                        'id': 541,
                        'text': '5.4.1.利用可逆性物理转换',
                    },
                    {
                        'id': 542,
                        'text': '5.4.2.出口处场的增强',
                    },
                ],
            },
            {
                'id': 55,
                'text': '5.5.产生物质的高级和低级方法',
                'children': [
                    {
                        'id': 551,
                        'text': '5.5.1.通过降解更高一级结构的物质来获取所需的物质',
                    },
                    {
                        'id': 552,
                        'text': '5.5.2.通过合成较低等级结构的物质来获取所需的物质',
                    },
                    {
                        'id': 553,
                        'text': '5.5.3.介于前两个解法之间',
                    },
                ],
            },
        ],
    },
];

$('#tree').jstree({
    'core': {
        'data': data1,
    }
});