const WebSocket = require('ws');
const querystring = require('querystring');
const PubgRequest = require('./Pubg/PubgRequest');
const PubgResponse = require('./Pubg/PubgResponse');
const PubgClient = require('./Pubg/PubgClient');

class GameServer {
    constructor(port = 8001) {
        this.port = port;
        this.lastAuth = null;
        this.lastPubgClient = null;

        this.start();
    }

    start() {
        this.server = new WebSocket.Server({ port: this.port });
        this.server.on('connection', this.handleConnection.bind(this));
        console.log(`GameServer started at http://localhost:${this.port}\n`);
    }

    handleConnection(clientSocket, req) {
        const [, encodedUri, query] = req.url.split('/');
        const qs = querystring.parse(query.substr(1));
        const uri = decodeURIComponent(encodedUri);

        console.log('New connection:')
        console.log(' - Client Version: ' + qs.clientGameVersion)
        console.log(' - SteamID: ' + qs.playerNetId)
        console.log(' - Region: ' + qs.cc + "\n\n")

        var data = '[0,null,"ClientApi","ConnectionAccepted","account.d97a9d0dc25948f18348816373392734",{"profile":{"Nickname":"zzVertigo","ProfileStatus":null,"InviteAllow":null,"Skin":{"Gender":"male","Hair":"skindesc.male.hair.02.02","Face":"skindesc.male.face.01.01","Presets":"male:M_Hair_B_02:M_Face_01:M_NudeBody_01"}},"inventory":null,"record":null,"account":{"AccountId":"account.d97a9d0dc25948f18348816373392734","Region":"na","PartnerId":null},"inviteAllow":null,"playinggame":null,"avatarUrl":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/58/58996926e5392cfeafbc867571cb7fc75fb5ecba.jpg","lobbyAppConfig":{"REPORT_URL":"http://report.playbattlegrounds.com/report"}}]';

        clientSocket.send(data);

        var dataParty = '[0,null,"ClientApi","Invalidate","client.party",null,null]';
        var dataMatch = '[0,null,"ClientApi","Invalidate","client.match",null,null]';
        var dataGame = '[0,null,"ClientApi","Invalidate","client.game",null,null]';
        var dataEvent = '[0,null,"ClientApi","Invalidate","client.event",null,null]';

        clientSocket.send(dataParty);
        clientSocket.send(dataMatch);
        clientSocket.send(dataGame);
        clientSocket.send(dataEvent);

        var dataPlayer = '[0,null,"ClientApi","InventoryInitialized",{"Items":[{"ItemDescId":"itemdesc.11010028","PartDescId":"partdesc.torso","Name":"Dirty Long-sleeved T-shirt","Desc":"","PresetId":"Item_Body_G_04","Quality":"common","Count":1,"BuyPrice":0,"SellPrice":30,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":false,"Doubling":false},{"ItemDescId":"itemdesc.21010001","PartDescId":"partdesc.torso","Name":"T-shirt (White)","Desc":"Basic costume. Unable to sell.","PresetId":"Item_Body_F_01","Quality":"basic","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":false,"Doubling":false},{"ItemDescId":"itemdesc.21010002","PartDescId":"partdesc.torso","Name":"T-shirt (GREY)","Desc":"Basic costume. Unable to sell.","PresetId":"Item_Body_F_04","Quality":"basic","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":true,"Doubling":false},{"ItemDescId":"itemdesc.21020001","PartDescId":"partdesc.legs","Name":"Combat Pants (khaki)","Desc":"Basic costume. Unable to sell.","PresetId":"Item_Legs_C_02","Quality":"basic","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":false,"Doubling":false},{"ItemDescId":"itemdesc.21020002","PartDescId":"partdesc.legs","Name":"Combat Pants (Brown)","Desc":"Basic costume. Unable to sell.","PresetId":"Item_Legs_C_03","Quality":"basic","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":true,"Doubling":false},{"ItemDescId":"itemdesc.21030002","PartDescId":"partdesc.feet","Name":"Hi-top Trainers","Desc":"Basic costume. Unable to sell.","PresetId":"Item_Feet_E_01","Quality":"basic","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":true,"Doubling":false},{"ItemDescId":"itemdesc.21090001","PartDescId":"partdesc.belt","Name":"Utility Belt","Desc":"Basic costume. Unable to sell.","PresetId":"Item_Belt_D_01","Quality":"basic","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":true,"Doubling":false},{"ItemDescId":"itemdesc.31010013","PartDescId":"partdesc.torso","Name":"PIONEER SHIRT","Desc":"","PresetId":"Item_Body_EA_01","Quality":"event","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":false,"Doubling":false}],"Equips":[[{"ItemDescId":"itemdesc.21010002","PartDescId":"partdesc.torso","PresetId":"Item_Body_F_04"},{"ItemDescId":"itemdesc.21020002","PartDescId":"partdesc.legs","PresetId":"Item_Legs_C_03"},{"ItemDescId":"itemdesc.21030002","PartDescId":"partdesc.feet","PresetId":"Item_Feet_E_01"},{"ItemDescId":null,"PartDescId":"partdesc.hands","PresetId":null},{"ItemDescId":null,"PartDescId":"partdesc.outer","PresetId":null},{"ItemDescId":null,"PartDescId":"partdesc.head","PresetId":null},{"ItemDescId":null,"PartDescId":"partdesc.mask","PresetId":null},{"ItemDescId":null,"PartDescId":"partdesc.eyes","PresetId":null},{"ItemDescId":"itemdesc.21090001","PartDescId":"partdesc.belt","PresetId":"Item_Belt_D_01"}]],"Currencies":[{"CurrencyId":"currencydesc.bp","Amount":999999}],"History":[{"ItemDescId":"itemdesc.10000000","Count":1}]}]'

        clientSocket.send(dataPlayer);

        clientSocket.on('message', data => {
            data = PubgRequest.parse(data);

            var ClientCallback = data["callbackId"];
            var ServerCallback = data["callbackId"] * -1;

            var Method = data["method"];

            var Arguments = data["arguments"];

            switch(Method)
            {
                case "GetUserMatchState":
                    clientSocket.send('[' + ServerCallback + ',null,true,{"Error":null,"Result":2}]')
                break;

                case "RequestMatch":
                    clientSocket.send('[' + ServerCallback + ',null,true,{"Error":null}]')
                    clientSocket.send('[0,null,"ClientApi","Invalidate","client.match",null,null]')
                break;

                case "GetStoreItems":
                    clientSocket.send('[' + ServerCallback + ',null,true,{"Error":null,"Result":[{"ItemDescId":"itemdesc.10000000","PartDescId":"partdesc.create","Name":"RANDOM CRATE","Desc":"","PresetId":"Item_Box_Root","Quality":"basic","Count":0,"BuyPrice":700,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":6,"InEquip":false,"Doubling":true},{"ItemDescId":"itemdesc.10000002","PartDescId":"partdesc.create","Name":"RANDOM CRATE","Desc":"","PresetId":"Item_Box_Root_NonSteam","Quality":"basic","Count":0,"BuyPrice":700,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":6,"InEquip":false,"Doubling":true}]}]')
                break;

                case "GetUserRecord":
                    clientSocket.send('[' + ServerCallback + ',null,true,{"Error":null,"Result":{"Season":"2018-01","Division":"division.bro.official.2018-01.na.solo","Region":"na","Match":"solo","AccountId":"account.d97a9d0dc25948f18348816373392734","Nickname":"xxVertigo","AvatarUrl":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/58/58996926e5392cfeafbc867571cb7fc75fb5ecba.jpg","Ranks":null,"PercentRanks":{"Rating":"35.0362","WinPoints":"31.1945","KillPoints":"68.1367"},"Records":{"Rating":"1266.77","BestRating":"1313.881","RoundsPlayed":"10","TimeSurvived":"8260.783","LongestTimeSurvived":"1712.769","WinPoints":"1065.602","DailyWins":"0","WeeklyWins":"0","Wins":"0","Top10s":"2","Losses":"10","WinRatio":"0","Top10Ratio":"0.2","WinTop10Ratio":"0","KillPoints":"1005.838","Days":"7","DailyKills":"0","WeeklyKills":"0","RoundMostKills":"2","Kills":"3","MaxKillStreaks":"1","Assists":"0","KillDeathRatio":"0.3","HeadshotKills":"0","HeadshotKillRatio":"0","VehicleDestroys":"0","RoadKills":"0","WalkDistance":"18305.1","RideDistance":"5459.924","MoveDistance":"23765.02","AvgWalkDistance":"1830.51","AvgRideDistance":"545.9924","AvgMoveDistance":"2376.502","LongestKill":"212.9656","Suicides":"0","TeamKills":"0","MostSurvivalTime":"1712.769","AvgSurvivalTime":"826.0783","Heals":"0","Boosts":"2","DamageDealt":"335.5399","WeaponAcquired":"37","DBNOs":"0","Revives":"0"}}}]')
                break;

                case "GetInventory":
                    clientSocket.send('[' + ServerCallback + ',null,true,{"Error":null,"Result":{"Items":[{"ItemDescId":"itemdesc.11010028","PartDescId":"partdesc.torso","Name":"Dirty Long-sleeved T-shirt","Desc":"","PresetId":"Item_Body_G_04","Quality":"common","Count":1,"BuyPrice":0,"SellPrice":30,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":false,"Doubling":false},{"ItemDescId":"itemdesc.21010001","PartDescId":"partdesc.torso","Name":"T-shirt (White)","Desc":"Basic costume. Unable to sell.","PresetId":"Item_Body_F_01","Quality":"basic","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":false,"Doubling":false},{"ItemDescId":"itemdesc.21010002","PartDescId":"partdesc.torso","Name":"T-shirt (GREY)","Desc":"Basic costume. Unable to sell.","PresetId":"Item_Body_F_04","Quality":"basic","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":true,"Doubling":false},{"ItemDescId":"itemdesc.21020001","PartDescId":"partdesc.legs","Name":"Combat Pants (khaki)","Desc":"Basic costume. Unable to sell.","PresetId":"Item_Legs_C_02","Quality":"basic","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":false,"Doubling":false},{"ItemDescId":"itemdesc.21020002","PartDescId":"partdesc.legs","Name":"Combat Pants (Brown)","Desc":"Basic costume. Unable to sell.","PresetId":"Item_Legs_C_03","Quality":"basic","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":true,"Doubling":false},{"ItemDescId":"itemdesc.21030002","PartDescId":"partdesc.feet","Name":"Hi-top Trainers","Desc":"Basic costume. Unable to sell.","PresetId":"Item_Feet_E_01","Quality":"basic","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":true,"Doubling":false},{"ItemDescId":"itemdesc.21090001","PartDescId":"partdesc.belt","Name":"Utility Belt","Desc":"Basic costume. Unable to sell.","PresetId":"Item_Belt_D_01","Quality":"basic","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":true,"Doubling":false},{"ItemDescId":"itemdesc.31010013","PartDescId":"partdesc.torso","Name":"PIONEER SHIRT","Desc":"","PresetId":"Item_Body_EA_01","Quality":"event","Count":1,"BuyPrice":0,"SellPrice":0,"PriceInCents":0,"WeeklyPurchaseLimit":0,"InEquip":false,"Doubling":false}],"Equips":[[{"ItemDescId":"itemdesc.21010002","PartDescId":"partdesc.torso","PresetId":"Item_Body_F_04"},{"ItemDescId":"itemdesc.21020002","PartDescId":"partdesc.legs","PresetId":"Item_Legs_C_03"},{"ItemDescId":"itemdesc.21030002","PartDescId":"partdesc.feet","PresetId":"Item_Feet_E_01"},{"ItemDescId":null,"PartDescId":"partdesc.hands","PresetId":null},{"ItemDescId":null,"PartDescId":"partdesc.outer","PresetId":null},{"ItemDescId":null,"PartDescId":"partdesc.head","PresetId":null},{"ItemDescId":null,"PartDescId":"partdesc.mask","PresetId":null},{"ItemDescId":null,"PartDescId":"partdesc.eyes","PresetId":null},{"ItemDescId":"itemdesc.21090001","PartDescId":"partdesc.belt","PresetId":"Item_Belt_D_01"}]],"Currencies":[{"CurrencyId":"currencydesc.bp","Amount":999999}],"History":[{"ItemDescId":"itemdesc.10000000","Count":1}]}}]')
                break;

                case "GetPartyData":
                    clientSocket.send('[' + ServerCallback + ',null,true,{"Error":null,"Result":null}]')
                break;

                case "GetOpenGameInfo":
                    clientSocket.send('[' + ServerCallback + ',null,true,{"Error":null,"Result":{"CurrentSeason":null,"IsSeasonOff":false,"MatchDescsByRegionAndPartyType":{"as":{"solo":"division.bro.official.2018-01.as.solo","duo":"division.bro.official.2018-01.as.duo","squad":"division.bro.official.2018-01.as.squad","solo-fpp":"division.bro.official.2018-01.as.solo-fpp","duo-fpp":"division.bro.official.2018-01.as.duo-fpp","squad-fpp":"division.bro.official.2018-01.as.squad-fpp"},"eu":{"solo":"division.bro.official.2018-01.eu.solo","duo":"division.bro.official.2018-01.eu.duo","squad":"division.bro.official.2018-01.eu.squad","solo-fpp":"division.bro.official.2018-01.eu.solo-fpp","duo-fpp":"division.bro.official.2018-01.eu.duo-fpp","squad-fpp":"division.bro.official.2018-01.eu.squad-fpp"},"oc":{"solo":"division.bro.official.2018-01.oc.solo","duo":"division.bro.official.2018-01.oc.duo","squad":"division.bro.official.2018-01.oc.squad","solo-fpp":"division.bro.official.2018-01.oc.solo-fpp","duo-fpp":"division.bro.official.2018-01.oc.duo-fpp","squad-fpp":"division.bro.official.2018-01.oc.squad-fpp"},"na":{"solo":"division.bro.official.2018-01.na.solo","duo":"division.bro.official.2018-01.na.duo","squad":"division.bro.official.2018-01.na.squad","solo-fpp":"division.bro.official.2018-01.na.solo-fpp","duo-fpp":"division.bro.official.2018-01.na.duo-fpp","squad-fpp":"division.bro.official.2018-01.na.squad-fpp"},"sa":{"solo":"division.bro.official.2018-01.sa.solo","duo":"division.bro.official.2018-01.sa.duo","squad":"division.bro.official.2018-01.sa.squad","solo-fpp":"division.bro.official.2018-01.sa.solo-fpp","squad-fpp":"division.bro.official.2018-01.sa.squad-fpp"},"sea":{"solo":"division.bro.official.2018-01.sea.solo","duo":"division.bro.official.2018-01.sea.duo","squad":"division.bro.official.2018-01.sea.squad","squad-fpp":"division.bro.official.2018-01.sea.squad-fpp"},"krjp":{"solo":"division.bro.official.2018-01.krjp.solo","duo":"division.bro.official.2018-01.krjp.duo","squad":"division.bro.official.2018-01.krjp.squad"}},"Options":null}}]')
                break;

                case "GetActivatedEvents":
                    clientSocket.send('[' + ServerCallback + ',null,true,[]]')
                break;

                case "GetUserMatchState":
                    clientSocket.send('[' + ServerCallback + ',null,true,{"Error":null,"Result":0}]')
                break;

                default:
                    console.log('Unknown Method Received!')
                    console.log('Client Callback - ' + ClientCallback + ' (' + Method + ')')
                    console.log('Arguments - ' + Arguments + '\n\n')
                break;
            }
        });

        clientSocket.on('close', () => {
            console.log('Game client closed connection');
        });
    }
}

module.exports = GameServer;