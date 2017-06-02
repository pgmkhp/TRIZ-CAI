// 定义全局变量
var projectname; // 项目名称
var description; // 问题描述
var member; // 项目成员
var imglist = []; // 图像描述
var startdate; // 开始日期
var enddate; // 结束日期

var curcomp = null; // 当前选中组件
var curline = null; // 当前选中线

var matrix1;
var matrix2;
var matrixlist;
var id2id;

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

// 保存项目基本信息
function handleImg(source) {
    imglist = [];
    for (var i=0; i<source.files.length; i++) {
        var file = source.files[i];
        var fr = new FileReader();        
        fr.readAsDataURL(file);
        fr.onloadend = function(e) {
            imglist.push(e.target.result);  
        };
    }
}

$('#save').click(function() {
    projectname = $('#projectname').val();
    description = $('#description').val();
    member = $('#member').val();
    startdate = $('#startdate').val();
    enddate = $('#enddate').val();

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
        Anchor: [
            [0.2,0,0,0], [0.4,0,0,0], [0.6,0,0,0], [0.8,0,0,0], 
            [0.2,1,0,0], [0.4,1,0,0], [0.6,1,0,0], [0.8,1,0,0], 
            [0,0.3,1,0], [0,0.5,1,0], [0,0.7,1,0],
            [1,0.3,0,0], [1,0.5,0,0], [1,0.7,0,0],
        ],
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
    $('.linebtn').attr('disabled', 'disabled');
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
    
    $('.linebtn').removeAttr('disabled');
    curline = null;
});

// 鼠标双击连线，修改连线标题以及连线样式
jsPlumb.bind("dblclick", function(conn, originalEvent) {
    $('#modifyline').modal('show');
    curline = conn;

    $('#fun1').html('<option selected> 请选择 </option>');
    $('#fun2').html('<option selected> 请选择 </option>');
    $('#fun3').html('<option> 请选择 </option>');
    for (var fun1 in chaindata) {
        $('#fun1').append('<option>'+ fun1 +'</option>');
    }

    $('#linestyle').html('<option> 请选择 </option><option value="1">直线</option><option value="2">曲线</option>');
});
$('#modifyline button:last').click(function() {
    var tmp;
    tmp = $('#fun3').children('option:selected')
    if (tmp.val() != '请选择') {
        curline.setLabel(tmp.val());
    }
    
    tmp = $('#linestyle').children('option:selected').attr('value');
    if (tmp == '1') {
        curline.setConnector('Straight');
        curline.addOverlay(["PlainArrow", {location: 1}]);
    } else if (tmp == '2') {
        curline.setConnector('Bezier');
        curline.addOverlay(["PlainArrow", {location: 1}]);
    }
    
    $('#modifyline').modal('hide');
    curline = null;
});
$('#fun1').change(function() {
    $('#fun2').html('<option selected> 请选择 </option>');
    $('#fun3').html('<option> 请选择 </option>');
    var fun1 = $('#fun1').children('option:selected').val();
    for (var fun2 in chaindata[fun1]) {
        $('#fun2').append('<option>'+ fun2 +'</option>');
    }
});
$('#fun2').change(function() {
    $('#fun3').html('<option selected> 请选择 </option>');
    var fun1 = $('#fun1').children('option:selected').val();
    var fun2 = $('#fun2').children('option:selected').val();
    for (var i=0; i<chaindata[fun1][fun2].length; i++) {
        $('#fun3').append('<option>'+ chaindata[fun1][fun2][i] +'</option>');
    }            
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
        var html = '<tr><td>不足</td><td>'+list2[i][0]+'</td><td>'+list2[i][2][0][0]+'</td><td>'+list2[i][1]+'</td><td><select class="form-control select2"></select></td></tr>';
        $('#top table').append(html);
    }
    for (var i=0; i<list3.length; i++) {
        var html = '<tr><td>过度</td><td>'+list3[i][0]+'</td><td>'+list3[i][2][0][0]+'</td><td>'+list3[i][1]+'</td><td><select class="form-control select3"></select></td></tr>';
        $('#top table').append(html);
    }
    for (var i=0; i<list4.length; i++) {
        var html = '<tr><td>有害</td><td>'+list4[i][0]+'</td><td>'+list4[i][2][0][0]+'</td><td>'+list4[i][1]+'</td><td><select class="form-control select4"></select></td></tr>';
        $('#top table').append(html);
    }
    $('.select2').html('<option>请选择</option>');
    $('.select2').change(function () {
        $(".select2").find("option:selected").addClass('selected');
    });
    for (var i=0; i<stdsoldata[2].length; i++) {
        $('.select2').append('<option id=s'+stdsoldata[2][i]+'>标准解'+ stdsoldata[2][i] +'</option>');
    }
    $('.select3').html('<option>请选择</option>');
    $('.select3').change(function () {
        $(".select3").find("option:selected").addClass('selected');
    });
    for (var i=0; i<stdsoldata[3].length; i++) {
        $('.select3').append('<option id=s'+stdsoldata[3][i]+'>标准解'+ stdsoldata[3][i] +'</option>');
    }
    $('.select4').html('<option>请选择</option>');
    $('.select4').change(function () {
        $(".select4").find("option:selected").addClass('selected');
    });
    for (var i=0; i<stdsoldata[4].length; i++) {
        $('.select4').append('<option id=s'+stdsoldata[4][i]+'>标准解'+ stdsoldata[4][i] +'</option>');
    }
});


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



// --------------------------------------
// |       作用链部分                    |
// --------------------------------------
$('#chainbtn').click(function() {
    // 初始化id对应id数组和邻接矩阵
    id2id = [];
    matrix1 = [];
    matrix2 = [];
    matrixlist = [];
    for (var id in line1data.adj) {   
        id2id.push(id);
    }
    for (var i=0; i<id2id.length; i++) {
        matrix1.push([]);
        for (var j=0; j<id2id.length; j++) {
            matrix1[i][j] = 0;
        }
    }

    // 得到邻接矩阵
    var tmplist;
    tmplist = line1data.getData();
    for (var i=0; i<tmplist.length; i++) {
        var s = id2id.indexOf(tmplist[i][0]);
        var t = id2id.indexOf(tmplist[i][1]);
        matrix1[s][t] = 1;
    }
    tmplist = line2data.getData();
    for (var i=0; i<tmplist.length; i++) {
        var s = id2id.indexOf(tmplist[i][0]);
        var t = id2id.indexOf(tmplist[i][1]);
        matrix1[s][t] = 1;
    }
    tmplist = line3data.getData();
    for (var i=0; i<tmplist.length; i++) {
        var s = id2id.indexOf(tmplist[i][0]);
        var t = id2id.indexOf(tmplist[i][1]);
        matrix1[s][t] = 1;
    }
    tmplist = line4data.getData();
    for (var i=0; i<tmplist.length; i++) {
        var s = id2id.indexOf(tmplist[i][0]);
        var t = id2id.indexOf(tmplist[i][1]);
        matrix1[s][t] = 1;
    }

    // 通过邻接矩阵得到可达矩阵
    matrixlist.push($M(matrix1).add(Matrix.I(matrix1.length)));
    for (var i=0; i<matrix1.length; i++) {
        matrixlist.push(matrixlist[i].multiply(matrixlist[i]));
    }
    matrix2 = matrixlist.pop().map(function(x) {return x ? 1 : 0;}).elements;

    // 获取作用链
    var slist = [];
    var tlist = [];
    for (var i=0; i<matrix1.length; i++) {
        if (!$M(matrix1).row(i+1).max()) {
            tlist.push(i);
        }
        if (!$M(matrix1).col(i+1).max()) {
            slist.push(i);
        }
    }

    var marked = new Array(matrix1.length);
    var pathlist = [];
    var path = [];
    function searchs2t(s, t) {
        if (path.length >= matrix1.length*matrix1.length/2) {
            return;
        }
        path.push(s);
        if (s == t) {
            console.log(path.join());
            pathlist.push(path.slice(0));
            path.pop();
            return;
        }
        for (var i=0; i<matrix1.length; i++) {
            if (path.indexOf(i)!=-1 && path[path.indexOf(i)-1]==path[path.length-1]) {
                continue;
            }
            if (path[path.length-1] == i) {
                continue;
            }
            if (matrix1[s][i]) {
                searchs2t(i, t);
            }
        }
        path.pop();
    }
    for (var i=0; i<slist.length; i++) {
        searchs2t(slist[i], tlist[0]);
    }

    // 输出id2id
    $('#id2id').html('<tbody></tbody>');
    for (var i=0; i<id2id.length; i++) {
        var name = $('#'+id2id[i]).html();
        $('#id2id tbody').append('<tr><td>'+ i +'</td><td>对应</td><td>'+ name +'</td></tr>');
    }

    // 输出邻接矩阵
    $('#matrix1 table').html('');
    for (var i=0; i<matrix1.length; i++) {
        var row = $(document.createElement('tr'));
        for (var j=0; j<matrix1.length; j++) {
            row.append('<td>'+ matrix1[i][j] +'</td>');
        }
        $('#matrix1 table').append(row);
    }

    // 输出可达矩阵
    $('#matrix2 table').html('');
    for (var i=0; i<matrix2.length; i++) {
        var row = $(document.createElement('tr'));
        for (var j=0; j<matrix2.length; j++) {
            row.append('<td>'+ matrix2[i][j] +'</td>');
        }
        $('#matrix2 table').append(row);
    }

    // 输出作用链
    var badmatrix = [];
    for (var i=0; i<id2id.length; i++) {
        badmatrix.push([]);
        for (var j=0; j<id2id.length; j++) {
            badmatrix[i][j] = 0;
        }
    }
    tmplist = line2data.getData();
    for (var i=0; i<tmplist.length; i++) {
        var s = id2id.indexOf(tmplist[i][0]);
        var t = id2id.indexOf(tmplist[i][1]);
        badmatrix[s][t] = 1;
    }
    tmplist = line3data.getData();
    for (var i=0; i<tmplist.length; i++) {
        var s = id2id.indexOf(tmplist[i][0]);
        var t = id2id.indexOf(tmplist[i][1]);
        badmatrix[s][t] = 1;
    }
    tmplist = line4data.getData();
    for (var i=0; i<tmplist.length; i++) {
        var s = id2id.indexOf(tmplist[i][0]);
        var t = id2id.indexOf(tmplist[i][1]);
        badmatrix[s][t] = 1;
    }

    $('#chain').html('');
    for (var i=0; i<pathlist.length; i++) {
        var pathdiv = $(document.createElement('div'));
        pathdiv.addClass('alert').addClass('alert-success');
        for (var j=0; j<pathlist[i].length-1; j++) {
            if (badmatrix[pathlist[i][j]][pathlist[i][j+1]]) {
                pathdiv.removeClass('alert-success').addClass('alert-danger');
                break;
            }
        }
        pathdiv.html(pathlist[i].join(' -> '));
        $('#chain').append(pathdiv);
    }
    $('#chain').append('<hr>');
    for (var i=0; i<pathlist.length; i++) {
        var pathdiv = $(document.createElement('div'));
        pathdiv.addClass('alert').addClass('alert-success');
        for (var j=0; j<pathlist[i].length-1; j++) {
            if (badmatrix[pathlist[i][j]][pathlist[i][j+1]]) {
                pathdiv.removeClass('alert-success').addClass('alert-danger');
                break;
            }
        }
        var names = [];
        for (var j=0; j<pathlist[i].length; j++) {
            names.push($('#'+id2id[pathlist[i][j]]).html());
        }
        pathdiv.html(names.join(' -> '));
        $('#chain').append(pathdiv);
    }

});



// --------------------------------------
// |       生成报告部分                  |
// --------------------------------------
$('#createbtn').click(function() {

    // 项目基本描述部分
    $('#oprojectname').html(projectname);
    $('#odescription').html(description);
    $('#omember').html(member);

    $('#opicture').html('');
    for (var i=0; i<imglist.length; i++) {
        var imgele = document.createElement('img');
        imgele.src = imglist[i];
        imgele.width = 100;
        $(imgele).addClass('img-thumbnail');
        $('#opicture').append(imgele);
    }

    if (startdate && enddate) {
        var datelist1 = startdate.split('-');
        var date1 = new Date(datelist1[0], datelist1[1]-1, datelist1[2]);
        var datelist2 = enddate.split('-');
        var date2 = new Date(datelist2[0], datelist2[1]-1, datelist2[2]);
        var days = (date2 - date1) / 1000 / 60 / 60 / 24;
        var str = '从 '+ startdate +' 到 '+ enddate +' ，共 '+ days +' 天';
        $('#odate').html(str);
    }

    // 系统分析部分
    var oboard = $('#board').clone();
    oboard.removeClass('board');
    oboard.addClass('oboard');
    $('#osysana').html(oboard);

    // 标准解部分
    var otable = $('#stdsoltable').clone();
    $('#ostdsol').html(otable);
    var selectedlist = $('.selected[id]');
    selectedlist.each(function() {
        var sid = $(this).attr('id').slice(1);
        $(this.parentNode.parentNode).html(data2[sid]);
    });

    //作用链部分
    var ochain = $('#chain').clone();
    $('#ochain').html(ochain);

});

