-- Initializing global variables to store the latest game state and game host process.
Game = Game or null
CRED = CRED or "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc"
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


Handler.add(
    "GetBotState", Handler.utils.hasMatchingTag("Action", 'GetBotState'), function(msg)
        if (isAuthorized(msg)) then
            local json = require("json")
            local GameState = json.encode({
                Game = Game,
                Commander = Commander,
                PrizeEarned = PrizeEarned,

            })
            ao.send({ Target = msg.From, Action = 'GameState', Data = GameState })
        end
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
            Game = msg.Tag.Commander
        end
    end
)
Handlers.add(
    "Move",
    Handlers.utils.hasMatchingTag("Action", "Move"),
    function(msg)
        if (isAuthorized(msg)) then
            ao.send({ Target = Game, Action = "PlayerMove", Direction = msg.Tags.Direction })
        end
    end
)

Handlers.add(
    "Attack",
    Handlers.utils.hasMatchingTag("Action", "Tick"),
    function(msg)
        if (isAuthorized(msg)) then
            ao.send({ Target = Game, Action = "PlayerAttack", AttackEnergy = msg.Tags.AttackEnergy })
        end
    end
)

Handlers.add(
    "Withdraw",
    Handlers.utils.hasMatchingTag("Action", "Withdraw"),
    function(msg)
        -- print(colors.gray .. "Getting game state..." .. colors.reset)
        if (isAuthorized(msg)) then
            ao.send({ Target = Game, Action = "Withdraw" })
        end
    end
)



Handlers.add(
    "Join",
    Handlers.utils.hasMatchingTag("Action", "Join"),
    function(msg)
        if (isAuthorized(msg)) then
            ao.send({ Target = CRED, Action = "Transfer", Quantity = "1000", Recipient = Game })
        end
    end
)

Prompt = function() return Name .. "> " end
