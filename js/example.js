/**
 * 模拟ECharts的force图动态加载
 * 由于ECharts中force图在node数目变化的时候会触发重新布局，如果采取真实的动态加载会
 * 触发很多次的布局，得不偿失。而如果在有需要做出动态加载的效果的情况下，
 * 切入点就是先让数据全部加载为一个单独的category，这个category的节点颜色为rgb(255,255,255,0)
 * 透明色，link的颜色也如此。当全部加载完的时候再逐步的把点线的颜色设置出来，
 * 模拟出动态添加node跟link的效果。
 * 当然这种方法只在node跟link的数量偏少的情况下比较合适。仅供参考。
 *
 *  author by So Aanyip
 *  1st Feb 2015
 */

var myChart = echarts.init(document.getElementById('main'),e_macarons);
myChart.setOption({
    title : {
        text: '模拟ECharts的force图动态加载',
        subtext: '',
        x:'right',
        y:'bottom',
        animation : false
    },
    tooltip : {
        show:false
    },
    toolbox: {
        show : true,
        feature : {
            saveAsImage : {show: true}
        }
    },
    legend: {
        x: 'left',
        data:['加载完成']
    },
    animation:false,
    addDataAnimation:false,
    series : [
        {
            type:'force',
            name : "",
            categories : [
                {
                    name: '关键人物'
                },
                {
                    name: '加载完成',
                    itemStyle : {
                        normal : {
                            color:'rgb(90,177,239)',
                            borderColor:'rgba(255,215,0,0.4)',
                            borderWidth:10,
                            linkStyle : {
                                type: 'curve',
                                lineWidth: 10,
                                width:10,
                                strokeColor:'#FF99CC',
                                color:'#000'
                            }
                        },
                    }
                },
                {
                    name: '正在加载',
                    itemStyle : {
                      normal : {
                        color:'rgba(255,255,255,0)',
                        borderColor:'rgba(255,255,255,0)',
                        borderWidth:0,
                      },
                      emphasis:{
                        color:'rgba(255,255,255,0)',
                        borderColor:'rgba(255,255,255,0)',
                        borderWidth:0,
                      }
                    }
                }
            ],
            itemStyle: {
                normal: {
                    label: {
                        show: false,
                        textStyle: {
                            color: '#333',
                            fontSize : 14,
                            fontFamily : '"Microsoft YaHei","微软雅黑",sans-serif'
                        }
                    },
                    nodeStyle : {
                        brushType : 'both',
                    },
                    linkStyle : {
                        lineWidth: 1,
                    }
                },
                emphasis: {
                    label: {
                        show: true,
                         textStyle: {
                            color: '#333'
                        }
                    },
                    nodeStyle : {
                        //r: 30
                    },
                    linkStyle : {}
                }
            },
            minRadius : 0.8,
            maxRadius : 27,
            gravity: 1,
            scaling: 2.5,     //like zoom 
            draggable: true,
            large : true,
            useWorker : true,
            coolDown: 0.9,
            /*roam : 'scale',*/
            nodes:[
               
            ],
            links : [
            ]
        }
    ]
});
    var nodeStr;
    var firstNodes = [];
    var num = 200;   //第一层点数目
    var num2 = 200;  //第二层点数目
    //先添加第二层的
    for(var i = num2-1;i>=0;i--){
        //给每一个node添加一个index的属性
        nodeStr={
            category:2,
            name:(i+num)+'',
            value:3,
            index:(i+num)
        };
        //通过unshift插入队头
        firstNodes.unshift(nodeStr);
    }
    for(var i = num-1;i>=0;i--){
        nodeStr={
            category:2,
            name:i+'',
            value:3,
            index:i
        };
        firstNodes.unshift(nodeStr);
    }
    //固定起始(中心)点的坐标,比较直观
    firstNodes[0].initial = [550,250];
    firstNodes[0].fixX = true;
    firstNodes[0].fixY = true;
    var linkStr;
    var firstLinks = [];
    //默认第二层一一对应第一层的点
    for(var i= 0;i<num2;i++){
        linkStr = {
            source:i+'',
            target:(i+num)+'',
            index:i+num,
            itemStyle:{
                normal:{
                    strokeColor:'#fff', //
                }
            }

        }
        firstLinks.push(linkStr);
    }
    //默认第一层的点都连接0点
    for(var i = 1;i<num;i++){
        linkStr = {
            source:'0',
            target:i+'',
            index:i,
            itemStyle:{
                normal:{
                    strokeColor:'#fff', //
                }
            }

        }
        firstLinks.push(linkStr);
    }

    var series = myChart.getSeries();
    //点线全部加载
    series[0].nodes = firstNodes;
    series[0].links = firstLinks;
    myChart.setSeries(series);
    //是否第一次布局.因为ecConfig.EVENT.FORCE_LAYOUT_END在每一次setSeries后都会触发.
    var jud = false; 
    myChart.on(ecConfig.EVENT.FORCE_LAYOUT_END,function(){
        if(jud) return;
        jud = true;
        //关掉loading显示
        document.getElementById('loading').style.display='none';
        var series = myChart.getSeries();
        var nodes = series[0].nodes;
        var links = series[0].links;
        var linkLen = links.length;
        var len = nodes.length;
        var ca2 = [];
        //将所有category2(隐藏组)的node入数组
        for(var i = 0;i<len;i++){
            if(nodes[i].category == 2){
                ca2.push(nodes[i]);
            }
        }
        //用于操作单个node
        var temp={};
        var count = 0;
        //定时器设置每一秒进行一次setSeries
        var interval = setInterval(function(){
            if(!ca2.length){
                clearInterval(interval);
                return;
            }
            //每一次setSeries出现50个点
            for(var i = 0;i<50;i++){
                if(!ca2.length) break;
                temp=ca2.shift();
                temp.category=1;
                //通过index关联点线,把跟当前相关的线也显示
                for(var j = 0;j<linkLen;j++){
                    if(links[j].index===temp.index){
                        links[j].itemStyle.normal.strokeColor='#ff0';
                    }
                }
                nodes[temp.index] = temp;
            }
            series[0].nodes = nodes;
            
            myChart.setSeries(series);
        },1000)

    })