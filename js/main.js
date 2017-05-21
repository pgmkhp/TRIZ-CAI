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
var line3 = {stroke: "green", strokeWidth:6};
var line4 = {stroke: "red", strokeWidth:2};

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
    line2data.addVertex(id);
    line3data.addVertex(id);
    line4data.addVertex(id);

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
            line2data.delVertex(id);
            line3data.delVertex(id);
            line4data.delVertex(id);
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
    curline = $(this).attr('id');
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
    if (curline == 'line1')
        line1data.addEdge(conn.sourceId, conn.targetId);
    else if (curline == 'line2')
        line2data.addEdge(conn.sourceId, conn.targetId);
    else if (curline == 'line3')
        line3data.addEdge(conn.sourceId, conn.targetId);
    else if (curline == 'line4')
        line4data.addEdge(conn.sourceId, conn.targetId);
    
    curline = null;
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
        line2data.delEdge(conn.sourceId, conn.targetId);
        line3data.delEdge(conn.sourceId, conn.targetId);
        line4data.delEdge(conn.sourceId, conn.targetId);

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
    var index = $.inArray(tid, this.adj[sid])
    if (index != -1)
        this.adj[sid].splice(index, 1);
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

$('#stdsolbtn').click(function () {
    $('#top table tbody').html('<tr><th>作用</th><th>源组件</th><th>作用名称</th><th>目标组件</th><th>标准解</th></tr>');

    var list2 = line2data.toString();
    var list3 = line3data.toString();
    var list4 = line4data.toString();

    for (var i=0; i<list2.length; i++) {
        var html = '<tr><td>不足</td><td>'+list2[i][0]+'</td><td>'+list2[i][2][0][0]+'</td><td>'+list2[i][1]+'</td><td></td></tr>';
        $('#top table').append(html);
    }
    for (var i=0; i<list3.length; i++) {
        var html = '<tr><td>过度</td><td>'+list3[i][0]+'</td><td>'+list3[i][2][0][0]+'</td><td>'+list3[i][1]+'</td><td></td></tr>';
        $('#top table').append(html);
    }
    for (var i=0; i<list4.length; i++) {
        var html = '<tr><td>有害</td><td>'+list4[i][0]+'</td><td>'+list4[i][2][0][0]+'</td><td>'+list4[i][1]+'</td><td></td></tr>';
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
var data2 = {
    '111': '假如只有S1，应增加S2 及力场F，以完整系统三要素，并使其有效。',
    '112': '假如系统不能改变，但可接受永久的或临时的添加物，可以在S1 或S2 内部添加来实现。',
    '113': '假如系统不能改变，但用永久的或临时的用外部添加物来改变S1 或S2 是可以接受的，则加之。',
    '114': '假定系统不能改变，但可用环境资源作为内部或外部添加物，是可接受的，则加之。',
    '115': '假定系统不能改变，但可以改变系统以外的环境，则改变之。',
    '116': '微小量的精确控制是困难的，则可以通过增加一个附加物，并在之后除去来控制微小量。',
    '117': '一个系统的场强度不够，增加场强度又会损坏系统，可将强度足够大的一个场施加到另一元件上，把该元件再连接到原系统上。同理，一种物质不能很好地发挥作用，则可连接到另一物质上发挥作用。',
    '118': '同时需要大的（强的）和小的（弱的）效应时，需小效应的位置可由物质S3 来保护。',
    '121': '在一个系统中有用及有害效应同时存在，S1及S2 不必互相接触，引入S3 来消除有害效应。',
    '122': '与1.2.1类似，但不允许增加新物质。通过改变S1 或S2 来消除有害效应。该类解包括增加“虚无物质”，如：空位、真空或空气、气泡等，或加一种场。',
    '123': '有害效应是一种场引起的，则引入物质S3吸收有害效应。',
    '124': '在一个系统中，有用、有害效应同时存在，但S1 及S2 必须处于接触状态，则增加场F2 使之抵消F1 的影响，或者得到一附加的有用效应。',
    '125': '在一个系统中，由于一个要素存在磁性而产生有害效应。将该要素加热到居里点以上，磁性将不存在，或者引入一相反的磁场消除原磁场。',
    '211': '串联的物-场模型：将S2 及F1 施加到S3；再将S3 及F2 施加到S1。两串联模型独立可控。',
    '212': '并联的物-场模型：一个可控性很差的系统已存在部分不能改变，则可并联第二个场。',
    '221': '对可控性差的场，用一易控场来代替，或增加一易控场：由重力场变为机械场或由机械场变为电磁场。其核心是由物理接触变到场的作用。',
    '222': '将S2 由宏观变为微观。',
    '223': '改变S2 成为允许气体或液体通过的多孔的或具有毛细孔的材料。',
    '224': '使系统更具柔性或适应性，通常方式是由刚性变为一个铰接，或成为连续柔性系统。',
    '225': '驻波被用于液体或粒子定位。',
    '226': '将单一物质或不可控物质变成确定空间结构的非单一物质，这种变化可以是永久的或临时的。',
    '231': '使F 与S1 或S2 的自然频率匹配或不匹配。',
    '232': '与F1 或F2 的固有频率匹配。',
    '233': '两个不相容或独立的动作可相继完成。',
    '241': '在一个系统中增加铁磁材料和（或）磁场。', 
    '242': '将No.16 与No.25 结合，利用铁磁材料与磁', 
    '243': '利用磁流体，这是No.26 的一个特例。', 
    '244': '利用含有磁粒子或液体的毛细结构。', 
    '245': '利用附加场，如涂层，使非磁场体永久或临时具有磁性。', 
    '246': '假如一个物体不能具有磁性，将铁磁物质引入到环境之中。', 
    '247': '利用自然现象，如物体按场排列，或在居里点以上使物体失去磁性。', 
    '248': '利用动态，可变成自调整的磁场。', 
    '249': '加铁磁粒子改变材料结构，施加磁场移动粒子，使非结构化系统变为结构化系统，或反之。', 
    '2410': '与F 场的自然频率相匹配。对于宏观系统，采用机械振动增加铁磁粒子的运动。在分子及原子水平上，材料的复合成分可通过改变磁场频率的方法用电子谐振频谱确定。', 
    '2411': '用电流产生磁场并代替磁粒子。',
    '2412': '电流变流体具有被电磁场控制的黏度，利用此性质及其他方法一起使用，如电流变流体轴承等。', 
    '311': '系统传递1：产生双系统或多系统。',
    '312': '改进双系统或多系统中的连接。',
    '313': '系统传递2: 在系统之间增加新的功能。',
    '314': '双系统及多系统的简化。',
    '315': '系统传递3: 利用整体与部分之间的相反特性。',
    '321': '系统传递4：传递到微观水平来控制。',
    '411': '替代系统中的检测与测量，使之不再需要。',
    '412': '若4.1.1不可能，则测量一复制品或肖像。',
    '413': '如4.1.1及4.1.2不可能，则利用两个检测量代替一个连续测量。',
    '421': '假如一个不完整物-场系统不能被检测，则增加单一或两个物-场系统，且一个场作为输出。假如已存在的场是非有效的，在不影响原系统的条件下，改变或加强该场，使它具有容易检测的参数。',
    '422': '测量一引入的附加物。',
    '423': '假如在系统中不能增加附加物，则在环境中增加而对系统产生一个场，检测此场对系统的影响。',
    '424': '假如附加场不能被引入到环境中去，则分解或改变环境中已存在的物质，并测量产生的效应。',
    '431': '利用自然现象。例如：利用系统中出现的已知科学效应，通过观察效应的变化，决定系统的状态。',
    '432': '假如系统不能直接或通过场测量，则测量系统或要素激发的固有频率来确定系统变化。',
    '433': '假如实现4.3.2不可能，则测量与已知特性相联系的物体的固有频率。',
    '441': '增加或利用铁磁物质或磁场以便测量。',
    '442': '增加磁场粒子或改变一种物质成为铁磁粒子以便测量。测量所导致的磁场变化即可。',
    '443': '假如4.4.2不可能建立一个复合系统，则添加铁磁粒子到系统中去。',
    '444': '假如系统中不允许增加铁磁物质，则将其加到环境中。',
    '445': '测量与磁性有关现象，如居里点、磁滞等。',
    '451': '若单系统精度不够，可用双系统或多系统。',
    '452': '代替直接测量，可测量时间或空间的一阶或二阶导数。',
    '511': '间接方法：1）使用无成本资源，如：空气、真空、气泡、泡沫、缝隙等；2）利用场代替物质；3）用外部附加物代替内部附加物；4）利用少量但非常活化的附加物；5）将附加物集中到一特定位置上；6）暂时引入附加物；7）假如原系统中不允许附加物，可在其复制品中增加附加物，这包括仿真器的使用；8）引入化合物，当它们起反应时产生所需要的化合物，而直接引入这些化合物是有害的；9）通过对环境或物体本身的分解获得所需的附加物。',
    '512': '将要素分为更小的单元。',
    '513': '附加物用完后自动消除。',
    '514': '假如环境不允许大量使用某种材料，则使用对环境无影响的东西。',
    '521': '使用一种场来产生另一种场。',
    '522': '利用环境中已存在的场。',
    '523': '使用属于场资源的物质。',
    '531': '状态传递1：替代状态。',
    '532': '状态传递2：双态。',
    '533': '状态传递3：利用转换中的伴随现象。',
    '534': '状态传递4：传递到双态。',
    '535': '利用元件或物质间的作用使其更有效。',
    '541': '自控制传递。假如一物体必须具有不同的状态，应使其自身从一个状态传递到另一状态。',
    '542': '当输入场较弱时，加强输出场，通常在接近状态转换点处实现。',
    '551': '通过分解获得物质粒子。',
    '552': '通过结合获得物质。',
    '553': '假如高等结构物质需分解但又不能分解，可用次高一级的物质状态替代；反之，如低等结构物质不能应用，则用高一级的物质代替。',
};

$('#tree').jstree({
    'core': {
        'data': data1,
    }
});
$('#tree').bind('select_node.jstree', function(e, data) {
    if (!data.node.children.length) {
        printStdSol(data.node.id);
    }
});
function printStdSol(num) {
    $('#stdsol').html(data2[num]);
}