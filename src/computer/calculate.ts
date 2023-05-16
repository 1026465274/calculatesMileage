import axios from 'axios';

export let distanceGL: number[] = [];

type Geo = {
  geocodes: [{
    formatted_address: string,
    province: string, //省份
    city: string,
    district: string //区
    location: string
  }]|[]
}

interface Utill {
  computer: (data: Array<any>, origins: string) => {}
}


type Distance = {
  "status": string,
  "info": string,
  "infocode": string,
  "count": string,
  "results": [
    {
      "origin_id": string,
      "dest_id": string,
      "distance": string,
      "duration": string
    }
  ]
}

 
/**
 *    
 * @param address 地址
 * @param city  城市  
 * @param flage  是否需要换算
 * @returns  promise
 */
export async function geo (address:string, city = '益阳',origins:string = ""): Promise<Geo> {
 if(address){
  try {
    const result = await axios.get(`https://restapi.amap.com/v3/geocode/geo?address=${address}&city=${city}&key=c3f0cb5c8d8bd8cafeeb451e3e82e15b`)
    return result.data as Geo;
  } catch {
    return Promise.reject({})
  }
}else{
  return Promise.resolve({ 
     geocodes: [{
    formatted_address: "",
    province: "", //省份
    city: "",
    district: "" ,
    location: origins
  }]})
}
  
}

async function distance(origins: string, destination: string): Promise<Distance> {
  try {
    const result = await axios.get(`https://restapi.amap.com/v3/distance?output=json&key=c3f0cb5c8d8bd8cafeeb451e3e82e15b&origins=${origins}&destination=${destination}&type=1`)
    return result.data;
  } catch (e) {
    return Promise.reject(e)
  }
}


export const utill: Utill = {

  computer(data, origins) {
    const resultData = JSON.parse(JSON.stringify(data)).reverse();

    let origins1 = "";
    // 起点经纬度
    let originsLocation: string;
    // 终点经纬度
    let destinationLocation: string;


    for (const [index, arrayList] of resultData.entries()) {
      // arrayList as Array<any>
  
      if (arrayList.length != 0) {
        try{  
                  
          // 判断次数据是否是 正确的 
           if (arrayList[4].indexOf("-")!=-1) {
          
      
          let hours = new Date(arrayList[3]).getHours();
          let hoursNext = new Date(resultData[index + 1][3]).getHours();
            
          if ( arrayList[4] == resultData[index + 1][4] && ((hours < 13 && hoursNext < 13) || (hours > 13 && hoursNext > 13))) {
             // 如果本次和下次的时间同一天且在同一时间段(上午 以一点作为分界线 下午) 那 第二条的起点就是第一条的终点
             // 如果是的话 这两条数据的时间是不是都是在同一时间段(上午 以一点作为分界线 下午) 如果是的话那么对比的第二条数据就是以
            // 当前的终点作为起点 例如 从  早上 10点到 A 第二天记录是11点 到B 那么 计算是公司到A 然后 A - B
            Promise.all([
              // 计算起点和终点的经纬度
              geo(origins1, "益阳",origins),
              geo(arrayList[5], "益阳")
            ]).then(([result1, result2]) => {
              // 计算起点与终点的距离
              debugger
              (distance(result1.geocodes[0]!.location, result2.geocodes[0]!.location) as Promise<Distance>).then(res => {
                distanceGL[index] = (Number(res.results[0].distance));
              }).catch(err => {
                console.log(err + "==== 请求距离出错")
              })
            })
              .catch(error => {
                // 至少一个 geo 函数被拒绝或出错时的处理逻辑
                originsLocation = "";
                destinationLocation = ""
                console.log(error + "==== 请求经纬度出错")
                distanceGL.push(0)
              });
            origins1 = arrayList[5]
          }else {
            Promise.all([
              // 计算起点和终点的经纬度
              geo(origins1, "益阳",origins),
              geo(arrayList[5], "益阳")
            ]).then(([result1, result2]) => {
              // 计算起点与终点的距离
              debugger
              (distance(result1.geocodes[0]!.location, result2.geocodes[0]!.location) as Promise<Distance>).then(res => {
                if(result1.geocodes[0]!.location ==  origins) {
                  //如果起点和 家的位置相同则直接距离乘2 
                distanceGL[index]=(Number(res.results[0].distance)*2)
         
              }else{
                // 如果不同则 
                distance(origins, result2.geocodes[0]!.location).then(res2 =>{
                  distanceGL[index] = (Number(res.results[0].distance) + Number(res2.results[0].distance))
                })
              }
              }).catch(err => {
                console.log(err + "==== 请求距离出错")
              })
            })
              .catch(error => {
                // 至少一个 geo 函数被拒绝或出错时的处理逻辑
                originsLocation = "";
                destinationLocation = "";
                console.log(error + "==== 请求经纬度出错")
                distanceGL.push(0)
              });
              origins1 = "";
          }
        } 
      
        }catch(e){ 
          console.log(e + "===== 遍历报错")
        }

     


      }
    }
    
    return resultData
  }
}





