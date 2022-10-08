//LiteLoaderScript Dev Helper
/// <reference path="c:\Users\zhang\Dropbox\Aids/dts/HelperLib-master/src/index.d.ts"/> 

ll.registerPlugin("HeadKeepInv", "Keep Inventory with Head!", [1,1,1]);

function CheckHead(pl){
    let itemlist = pl.getInventory().getAllItems();
    let count = 0;
    for(let i in itemlist){
        if(itemlist[i].type == "minecraft:skull" && itemlist[i].aux == 3) {
            count += itemlist[i].count;
        }
    }
    let helmet = pl.getArmor().getItem(0);
    if(helmet.type == "minecraft:skull" && helmet.aux == 3){
        count += 1;
    }
    return count;
}
function RemoveHead(pl){
    let helmet = pl.getArmor().getItem(0);
    if(helmet.type == "minecraft:skull" && helmet.aux == 3){
        pl.getArmor().removeItem(0,1);
        pl.refreshItems();
        return;
    }

    let itemlist = pl.getInventory().getAllItems();
    let count=0;
    for(i of itemlist){
        if(i.type == "minecraft:skull" && i.aux == 3) {
            pl.getInventory().removeItem(count, 1);
            break;
        }
        count ++;
    }
    pl.refreshItems();
}

function DropInventory(pl) {
    let itemlist = pl.getInventory().getAllItems();
    for(let i in itemlist){
        if(!itemlist[i].isNull()){
            mc.spawnItem(itemlist[i], pl.pos);
        }
    }
    pl.getInventory().removeAllItems();

    let armor = pl.getArmor().getAllItems();
    for(let j in armor){
        if(!armor[j].isNull()){
            mc.spawnItem(armor[j], pl.pos);
        }
    }
    pl.getArmor().removeAllItems();

    let offhandItem = pl.getOffHand();
    mc.spawnItem(offhandItem, pl.pos);
    pl.clearItem(offhandItem.type);
}


function DropOnDeath(pl){
    if(CheckHead(pl) > 0) {
        RemoveHead(pl);
        mc.broadcast(Format.Yellow + pl.name+" 消耗了一个头颅,保住了物品栏!");
    }
    else {
        DropInventory(pl);
    }
}

mc.listen("onPlayerDie", (pl, source) => {
    DropOnDeath(pl);
})