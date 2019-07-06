// 保存页面数据缓存
let global_data;

// 解析头部
function parserHead(array_buffer) {
    // 数据头部
    let head = {};
    let head_length = Array.prototype.indexOf.call(new Int8Array(array_buffer), 0);

    try {
        let head_raw = String.fromCharCode.apply(null, new Int8Array(array_buffer, 0, head_length));
        let head_arr = head_raw.split(',');
        for (let j = 0; j < head_arr.length; j++) {
            let pair = head_arr[j].split(':');
            head[pair[0]] = pair[1];
        }
    } catch (err) {
        console.error('解析数据头部发生错误', err);
    }

    return { head, head_length };
}

// 解析Body
function parserBody(array_buffer) {
    let { head, head_length } = parserHead(array_buffer);
    let offset = head_length + 1;   // 1 - 分隔符 '\0'
    let result = [];

    // 每一页的点数量
    let page_point_cnt = [
        head.p1, head.p2, head.p3, head.p4,
        head.p5, head.p6, head.p7, head.p8
    ];
    page_point_cnt = page_point_cnt.map(item => Number(item))

    // 分别处理每一页
    for (let i = 0; i < page_point_cnt.length; i++) {

        result[i] = [];

        // 处理第i+1页的数据
        for (let j = 0; j < page_point_cnt[i]; j++) {
            let dv = new DataView(array_buffer, offset + j * 10, 10);
            let x = dv.getUint16(0, false);
            let y = dv.getUint16(2, false);
            let p = dv.getUint16(4, false);
            let t = dv.getUint32(6, false);
            result[i].push({ x, y, p, t });
        }

        // 计算下一页的偏移量
        offset = offset + page_point_cnt[i] * 10;
    }
    
    return result;
}

// 绘制页面
function drawDigitalPage(index){
    let canvas = document.getElementById('digital-page')
    let ctx = canvas.getContext('2d')
    let page = global_data[index];

    ctx.clearRect(0, 0, 700, 990);
    
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    for(let i = 0; i < page.length; i++){
        if(page[i].p === 0){
            ctx.moveTo(Math.round(page[i].x / 30),Math.round( page[i].y/30))
        }else{
            ctx.lineTo(Math.round(page[i].x / 30),Math.round( page[i].y/30))
        }
    }
    ctx.closePath();
    ctx.stroke();
}

// 获取数据
fetch('digital.data')
    .then(response => response.arrayBuffer())
    .then(parserBody)
    .then(data => global_data = data)