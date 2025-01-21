
ll.registerPlugin("HeadKeepInv", "Keep Inventory with Head!", [1, 2, 3]);
// Basic Logger added
// OffhandDrop can be turned off

logger.setConsole(true);
logger.setFile("./logs/HeadKeepInv.log", 4);
logger.setTitle("HeadKeepInv");

// ******************************************************************
// LL 1.12.3 在执行clearItem()清除副手物品时出现问题，后台报错，并且玩家副手物品被复制
// 临时解决一下：“直接把副手掉落部分去掉”
var OffhandDrop = false; // 副手掉落开关
// ******************************************************************

const HEAD_ID = "minecraft:player_head"

function CheckHead(pl) {
    let itemlist = pl.getInventory().getAllItems();
    let count = 0;
    for (let i of itemlist) {
        if (i.type == HEAD_ID) {
            count += i.count;
        }
    }
    let helmet = pl.getArmor().getItem(0);
    if (helmet.type == HEAD_ID) {
        count += 1;
    }
    return count;
}
function RemoveHead(pl) {
    let helmet = pl.getArmor().getItem(0);
    if (helmet.type == HEAD_ID) {
        pl.getArmor().removeItem(0, 1);
        pl.refreshItems();
        return;
    }

    let itemlist = pl.getInventory().getAllItems();
    let count = 0;
    for (let i of itemlist) {
        if (i.type == HEAD_ID) {
            pl.getInventory().removeItem(count, 1);
            break;
        }
        count++;
    }
    pl.refreshItems();
}

function hasCurseofVanishing(it) {
    if (it == null) return false;
    let tag = it.getNbt().getData("tag");
    if (tag != null) {
        let ench = tag.getData("ench");
        if (ench != null) {
            ench = ench.toArray();
            for (let e of ench) {
                if (e.id == 28) {
                    return true;
                }
            }
        }
    }
    return false;
}

function DropInventory(pl) {
    let droplog = pl.name + "," + pl.blockPos.x + "," + pl.blockPos.y + "," + pl.blockPos.z + "," + pl.blockPos.dimid + ",";

    let itemlist = pl.getInventory().getAllItems();
    for (let it of itemlist) {
        if (!it.isNull()) {
            if (!hasCurseofVanishing(it)) {
                mc.spawnItem(it, pl.pos);
                try {
                    droplog += it.type + "*" + it.count + ",";
                } catch (e) {
                    logger.error(e);
                }
            }
        }
    }
    pl.getInventory().removeAllItems();

    let armor = pl.getArmor().getAllItems();
    for (let ar of armor) {
        if (!ar.isNull()) {
            if (!hasCurseofVanishing(ar)) {
                mc.spawnItem(ar, pl.pos);
                try {
                    droplog += ar.type + "*" + ar.count + ",";
                } catch (e) {
                    logger.error(e);
                }
            }
        }
    }
    pl.getArmor().removeAllItems();

    let offhandItem = pl.getOffHand();
    if (offhandItem && OffhandDrop) {        // 防止因为clearItem()问题导致副手刷物品
        if (!hasCurseofVanishing(offhandItem)) {
            mc.spawnItem(offhandItem, pl.pos);
            try {
                droplog += offhandItem.type + "*" + offhandItem.count + ",";
            } catch (e) {
                logger.error(e);
            }
        }
        pl.clearItem(offhandItem.type);
    }

	pl.refreshItems();
    logger.info(droplog);
}

//死亡的玩家会掉落价值为“经验等级×7”经验值的经验球，且总价值最大为100点（足够从0级升级到7级），其余的经验值会遗失。
function DropExperience(pl) {
    if (pl.pos.dimid != 0) {
        return;//目前不支持主世界以外的经验掉落
    }

    let pos = pl.blockPos;

    let lvl = pl.getLevel();
    let drop = lvl * 7;
    pl.setTotalExperience(pl.getTotalExperience() - drop);
    for (let i = 0; i < drop && i < 100; i++) {
        mc.runcmdEx("summon xp_orb " + pos.x + " " + pos.y + " " + pos.z);
    }

}

function DropOnDeath(pl) {
    if (CheckHead(pl) > 0) {
        RemoveHead(pl);
        mc.broadcast(Format.Yellow + pl.name + " 消耗了一个头颅,保住了物品栏和经验!");
    }
    else {
        DropInventory(pl);
        DropExperience(pl);
    }
}

mc.listen("onPlayerDie", (pl, source) => {
    DropOnDeath(pl);
})

mc.listen("onServerStarted", () => {
    mc.runcmdEx("gamerule KeepInventory True");
})