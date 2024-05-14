Variant = "0.2"
CRED = 'Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc'
Game = Game
Range = 3

AutoPlay = AutoPlay or false
ElimitedCount = ElimitedCount or 0
UnderAttackCount = ElimitedCount or 0
KillingCount = KillingCount or 0

JoinGameRequestTime = JoinGameRequestTime or 0
JoinGameConfirmTime = JoinGameConfirmTime or 0

LatestGameState = LatestGameState or {
    GameMode = 'Waiting',
    Players = {}
}


-- CurrentTime = CurrentTime or 0
CurrentTimestamp = CurrentTimestamp or 0
GameStateReceviedTime = GameStateReceviedTime or 0

local colors = {
    red = "\27[31m",
    green = "\27[32m",
    blue = "\27[34m",
    reset = "\27[0m",
    gray = "\27[90m"
}

local directionMap = { "Up", "Down", "Left", "Right", "UpRight", "UpLeft", "DownRight", "DownLeft" }

function OwnerOnly(fn)
    return function(msg)
        if Owner ~= msg.From then
            return 0
        end
        return fn(msg)
    end
end

function GameOnly(fn)
    return function(msg)
        if Game ~= msg.From then
            return 0
        end
        return fn(msg)
    end
end

function CronOnly(msg)
    return msg.Cron and Handlers.utils.hasMatchingTag('Action', 'Cron')
end

local function inGame()
    if (LatestGameState.Players[ao.id] == nil) then
        return false
    end
    return true
end

local function inRange(x1, y1, x2, y2, range)
    return math.abs(x2 - x1) <= range and math.abs(y2 - y1) <= range
end

local function joinGame()
    print(colors.green .. CurrentTimestamp .. ':joining game' .. colors.reset)
    ao.send({ Target = CRED, Action = "Transfer", Quantity = "1000", Recipient = Game })
    JoinGameRequestTime = CurrentTimestamp
end

local function attack(energy)
    print(colors.green .. CurrentTimestamp .. ':attacking energy ' .. energy .. colors.reset)
    ao.send({ Target = Game, Action = "PlayerAttack", AttackEnergy = tostring(energy) })
end

local function move(direction)
    print(colors.green .. CurrentTimestamp .. ':move ' .. direction .. colors.reset)
    ao.send({ Target = Game, Action = "PlayerMove", Direction = direction })
end

local function withraw()
    print(colors.green .. CurrentTimestamp .. ':withraw' .. colors.reset)
    ao.send({ Target = Game, Action = "Withdraw" })
end

local function runAway()

end

local function actionAfterAttacked(damage, health)
    local me = LatestGameState.Players[ao.id]
    local inRangeCount = 0

    for id, state in pairs(LatestGameState.Players) do
        if id ~= ao.id and inRange(me.x, me.y, state.x, state.y, Range) then
            inRangeCount = inRangeCount + 1
        end
    end

    if (health < 50) then
        withraw()
        return
    end

    if (inRangeCount > 2) then
        withraw()
        return
    end

    if (inRangeCount == 1) then
        attack(me.energy)
    end
end

local function decideNextAction()
    local targetInRange = 0
    local me = LatestGameState.Players[ao.id]

    for target, state in pairs(LatestGameState.Players) do
        if target ~= ao.id and inRange(me.x, me.y, state.x, state.y) then
            targetInRange = targetInRange + 1
        end
    end

    -- 1 / 3 chance of always running away
    local runAway = math.random(3) == 1
    if player.energy > 5 and targetInRange and targetInRange < 3 and not runAway then
        print(colors.blue .. "[Action]: Attack" .. colors.reset)
        ao.send({
            Target = Game,
            Action = "PlayerAttack",
            Player = ao.id,
            AttackEnergy = tostring(player.energy)
        })
    else
        local randomIndex = math.random(#directionMap)
        print(colors.blue .. "[Action]: Move " .. directionMap[randomIndex] .. colors.reset)
        ao.send({
            Target = Game,
            Action = "PlayerMove",
            Player = ao.id,
            Direction = directionMap[randomIndex]
        })
    end
end

Handlers.add('SetAutoPlay', OwnerOnly(Handlers.utils.hasMatchingTag('Action', 'SetAutoPlay')), function(msg)
    AutoPlay = tonumber(msg.Tags.AutoPlay) ~= 0
end)

Handlers.add('SetGameId', OwnerOnly(Handlers.utils.hasMatchingTag('Action', 'SetGameId')), function(msg)
    Game = msg.Tags.GameId
end)

-- Trigger by a Cron every 5 seconds
Handlers.add("Cron", CronOnly, function(msg)
    print(colors.gray .. msg.Timestamp .. ":Cron Trigger fetching GameState" .. colors.reset)
    if msg.Timestamp <= CurrentTimestamp then
        return
    end
    -- use the message timestmap as the proximity
    -- TODO check with devs to confirm there is no timestmap avaible in AO
    CurrentTimestamp = msg.Timestamp
    ao.send({
        Target = Game,
        Action = "GetGameState"
    })
end)

-- Handler to update state and decide action
Handlers.add("UpdateGameState", GameOnly(Handlers.utils.hasMatchingTag("Action", "GameState")), function(msg)
    print(colors.blue .. msg.Timestamp .. ":receive GameState" .. colors.reset)

    if (msg.Timestamp <= GameStateReceviedTime) then
        -- ignore out dated message
        return
    end
    GameStateReceviedTime = msg.Timestamp

    local latencyInSecond = math.abs(math.floor((CurrentTimestamp - GameStateReceviedTime) / 1000))

    local json = require("json")
    LatestGameState = json.decode(msg.Data)
    GameStateReceviedTime = msg.Timestamp or GameStateReceviedTime


    print(colors.gray .. 'latency in seconds::' .. math.floor(latencyInSecond / 1000) .. colors.reset)
    -- latency is too high, do nothing
    if (latencyInSecond > 60) then
        print(colors.red .. 'latency is terrible. No Player' .. colors.reset)
        withraw()
    elseif (latencyInSecond > 30) then
        print(colors.red .. 'latency is bad' .. colors.reset)
    elseif (latencyInSecond > 10) then
        print(colors.gray .. 'latency is average' .. colors.reset)
    else
        print(colors.gray .. 'latency is good' .. colors.reset)
    end

    if (LatestGameState.GameMode ~= 'Playing') then
        print(colors.gray .. "Game hasn't started, do nothing" .. colors.reset)
        return
    end

    if (~inGame()) then
        print(colors.gray .. 'Me is not in the game, do nothing' .. colors.reset)
        return
    end

    decideNextAction()
end)


Handlers.add(
    "UnderAttack",
    GameOnly(Handlers.utils.hasMatchingTag("Action", "Hit")),
    function(msg)
        print(colors.red .. CurrentTimestamp .. ':attacked')
        actionAfterAttacked(tonumber(msg.Tags.Damage), tonumber(msg.Tags.Health)) -- Make a decision after being attacked
    end
)

Handlers.add(
    'OnJoin', GameOnly(Handlers.utils.hasMatchingData('You are in the game"')), function(msg)
        if (msg.Timestamp > JoinGameRequestTime) then
            print(colors.gray .. CurrentTimestamp .. ": joinGame at " .. msg.Timestamp .. colors.reset)
            JoinGameConfirmTime = msg.Timestamp
        end
    end
)

Handlers.add('FromGame', GameOnly(function() return true end), function(msg)
    print(colors.gray .. msg .. colors.reset)
end)
