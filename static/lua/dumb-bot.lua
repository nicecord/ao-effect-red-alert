Variant = "0.2"
CRED = CRED or 'Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc'
PrizeEarned = PrizeEarned or 0
EnemyKilled = EnemyKilled or 0
ElimitedCount = ElimitedCount or 0

local function isAuthorized(msg)
    if (msg.From == Owner) then
        return true
    else
        return false
    end
end


Handlers.add(
    "GetBotState", Handlers.utils.hasMatchingTag("Action", 'GetBotState'), function(msg)
        local json = require("json")
        local BotState = json.encode({
            PrizeEarned = PrizeEarned,
            BotVersion = Variant
        })
        ao.send({ Target = msg.From, Action = 'BotState', Data = BotState })
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
    Handlers.utils.hasMatchingTag("Action", "Attack"),
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
            ao.send({ Target = CRED, Action = "Transfer", Quantity = "1000", Recipient = msg.Tags.Game })
        end
    end
)

Prompt = function() return Name .. "> " end
