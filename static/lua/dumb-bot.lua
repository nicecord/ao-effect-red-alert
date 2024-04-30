BotVersion = BotVersion or 0.1

Commander = Commander or 'sPrj-GOt5fgfohZK5jCqh4ZfIn5cbD74RHgS9SX7KVE'

PrizeEarned = PrizeEarned or 0
EnemyKilled = EnemyKilled or 0
ElimitedCount = ElimitedCount or 0

local function isAuthorized(msg)
    if (msg.From == Owner or msg.From == Commander) then
        return true
    else
        return false
    end
end


Handlers.add(
    "GetBotState", Handlers.utils.hasMatchingTag("Action", 'GetBotState'), function(msg)
        local json = require("json")
        local BotState = json.encode({
            Commander = Commander,
            PrizeEarned = PrizeEarned,
            BotVersion = BotVersion
        })
        ao.send({ Target = msg.From, Action = 'BotState', Data = BotState })
    end
)
-- Handler to trigger game state updates.
Handlers.add(
    "SetGameId",
    Handlers.utils.hasMatchingTag("Action", "SetGameId"),
    function(msg)
        if (isAuthorized(msg)) then
            Game = msg.Tags.GameId
        end
    end
)

Handlers.add(
    "SetCommander",
    Handlers.utils.hasMatchingTag("Action", "SetCommander"),
    function(msg)
        if (isAuthorized(msg)) then
            Commander = msg.Tag.Commander
        end
    end
)
Handlers.add(
    "Move",
    Handlers.utils.hasMatchingTag("Action", "Move"),
    function(msg)
        if (isAuthorized(msg)) then
            ao.send({ Target = msg.Tags.Game, Action = "PlayerMove", Direction = msg.Tags.Direction })
        end
    end
)

Handlers.add(
    "Attack",
    Handlers.utils.hasMatchingTag("Action", "Tick"),
    function(msg)
        if (isAuthorized(msg)) then
            ao.send({ Target = msg.Tags.Game, Action = "PlayerAttack", AttackEnergy = msg.Tags.AttackEnergy })
        end
    end
)

Handlers.add(
    "Withdraw",
    Handlers.utils.hasMatchingTag("Action", "Withdraw"),
    function(msg)
        -- print(colors.gray .. "Getting game state..." .. colors.reset)
        if (isAuthorized(msg)) then
            ao.send({ Target = msg.Tags.Game, Action = "Withdraw" })
        end
    end
)



Handlers.add(
    "Join",
    Handlers.utils.hasMatchingTag("Action", "Join"),
    function(msg)
        if (isAuthorized(msg)) then
            ao.send({ Target = msg.Tags.Token, Action = "Transfer", Quantity = "1000", Recipient = msg.Tags.Game })
        end
    end
)

Prompt = function() return Name .. "> " end
