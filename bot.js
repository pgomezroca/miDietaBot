
import fetch from "node-fetch";
import {Telegraf} from 'telegraf';
import * as dotenv from 'dotenv'
dotenv.config()



const SCHEDULE_URL = "https://docs.google.com/spreadsheets/d/1R1sZ6Cik323lbTS2sL1ipxFtCFXpkfnkY1_7jXqvJ-Q/export?gid=0&format=csv";


function csvJSON(csv){

  var lines=csv.split("\n");
  
  var result = [];
  
  var headers=lines[0].split(",");
  console.log(headers);

  for(var i=1;i<lines.length;i++){

      var obj = {};
      var currentline=lines[i].split(",");
      
      for(var j=0;j<headers.length ;j++){
          obj[headers[j].replace("\r",'')] = currentline[j].replace("\r",'');
      }

      result.push(obj);
      // console.log(result)
  }
  return result;

}

const getSchedule = async ()=>{

  const response = await fetch(SCHEDULE_URL);

  
  const data = await response.text();


  return csvJSON(data);
}


const bot = new Telegraf(process.env.BOT_TOKEN);


    bot.command('start',(ctx)=>{
      var chatId = ctx.chat.id;
      var botonGo= {
        reply_markup:{
        inline_keyboard:[
         [{text:"Menú día por día", callback_data:"menu"}]
         
         ]}
         
        }
        
      var botones = {
          reply_markup:{
              inline_keyboard:[
               [{text:"Lunes", callback_data:"lunes"}],
               [{text:"Martes", callback_data:"martes"}],
               [{text:"Miercoles", callback_data:"miercoles"}],
               [{text:"Jueves", callback_data:"jueves"}],
               [{text:"Viernes", callback_data:"viernes"}],
               [{text:"Sabado", callback_data:"sabado"}],
               [{text:"Domingo",callback_data:'domingo'}]
           ]
              
          },
          parse_mode:"HTML",
      };
      bot.action("menu",(ctx)=>{
        ctx.deleteMessage()
        ctx.telegram.sendMessage(chatId,"Menu", botones)
      })
      getSchedule().then(schedules=>{
  
        for(let i=0; i<schedules.length; i++){ 
      
          bot.action(schedules[i].dia, (ctx) => {
            ctx.deleteMessage()
            ctx.telegram.sendMessage(ctx.chat.id,` Hoy  ${schedules[i].dia} tu menú es:
            Desayuno:${schedules[i].desayuno}
            Colación media mañana: ${schedules[i].colacion}
            Almuerzo:${schedules[i].almuerzo}
            Merienda :${schedules[i].merienda}
            Colación de media tarde:${schedules[i].extra}
            Cena: ${schedules[i].cena}
            Recetas:${schedules[i].recetas}`
            ,botonGo)
          })
      
        }  
      })
      
      bot.telegram.sendMessage(chatId,`Buenos días ${ctx.from.first_name} \n`+"Quieres  saber el menú especial de esta semana? \n"+ 'Haz click en el boton de abajo' , botonGo);
    
    })
    
bot.launch()