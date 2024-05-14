CRED = "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc"
Variant = "0.6"

Players = Players or {}
PaymentQty = PaymentQty or 1 -- Quantity of tokens for registration
TURN_TIME = 250
-- Attack info
LastPlayerAttacks = LastPlayerAttacks or {}
CurrentAttacks = CurrentAttacks or 0
TenSecondCheck = TenSecondCheck or 0

-- grid dimensions
Width = 40
Height = 40
Range = 3

-- Player energy
MaxEnergy = 100
EnergyPerSec = 1
-- Attack settings
AverageMaxStrengthHitsToKill = 3 -- Average number of hits to eliminate a player



-- Sends a reward to a player.
-- @param recipient: The player receiving the reward.
-- @param qty: The quantity of the reward.
-- @param reason: The reason for the reward.
function sendReward(recipient, qty, reason)
    ao.send({
        Target = PaymentToken,
        Action = "Transfer",
        Quantity = tostring(qty),
        Recipient = recipient,
        Reason = reason
    })
end

-- Handles the elimination of a player from the game.
-- @param eliminated: The player to be eliminated.
-- @param eliminator: The player causing the elimination.
function eliminatePlayer(eliminated, eliminator)
    sendReward(eliminator, tonumber(Balances[eliminated]), "Eliminated-Player")
    Balances[eliminated] = "0"
    Players[eliminated] = nil

    Send({
        Target = eliminated,
        Action = "Eliminated",
        Eliminator = eliminator
    })
    removeListener(eliminated)

    local playerCount = 0
    for player, _ in pairs(Players) do
        playerCount = playerCount + 1
    end
end

-- Initializes default player state
-- @return Table representing player's initial state
function playerInitState()
    return {
        x = math.random(1, Width),
        y = math.random(1, Height),
        health = 100,
        energy = 0,
        lastTurn = 0
    }
end

-- convert token to heathy point
function scaleNumber(oldValue)
    local oldMin = 10
    local oldMax = 1000
    local newMin = 1
    local newMax = 100

    local newValue = (((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin
    return newValue
end

-- Function to incrementally increase player's energy
-- Called periodically to update player energy
function onTick()
    if GameMode ~= "Playing" then return end -- Only active during "Playing" state

    if LastTick == undefined then LastTick = Now end

    local Elapsed = Now - LastTick
    if Elapsed >= TURN_TIME then -- Actions performed every TURN
        for player, state in pairs(Players) do
            local newEnergy = math.floor(math.min(MaxEnergy, state.energy + (Elapsed * EnergyPerSec // 2000)))
            state.energy = newEnergy
        end
        LastTick = Now
    end

    if TenSecondCheck == 0 then
        TenSecondCheck = Now
    end

    local TenSecondElaspedCheck = Now - TenSecondCheck
    if TenSecondElaspedCheck >= 10000 then
        -- only keep the last 20
        while #LastPlayerAttacks > 20 do
            table.remove(LastPlayerAttacks, 1)
        end
        TenSecondCheck = Now
    end
end

local function isOccupied(x, y)
    local result = false
    for k, v in pairs(Players) do
        if v.x == x and v.y == y then
            result = true
            return
        end
    end
    return result
end

-- Handles player movement
-- @param msg: Message request sent by player with movement direction and player info
function move(msg)
    local playerToMove = msg.From
    local direction = msg.Tags.Direction

    local directionMap = {
        Up = { x = 0, y = -1 },
        Down = { x = 0, y = 1 },
        Left = { x = -1, y = 0 },
        Right = { x = 1, y = 0 },
        UpRight = { x = 1, y = -1 },
        UpLeft = { x = -1, y = -1 },
        DownRight = { x = 1, y = 1 },
        DownLeft = { x = -1, y = 1 }
    }

    -- only 1 turn per 1/4 second
    if msg.Timestamp < Players[playerToMove].lastTurn + TURN_TIME then
        return
    end
    -- calculate and update new coordinates
    if directionMap[direction] then
        local newX = Players[playerToMove].x + directionMap[direction].x
        local newY = Players[playerToMove].y + directionMap[direction].y

        -- Player cant move to cell already occupied.
        if isOccupied(newX, newY) then
            Send({ Target = playerToMove, Action = "Move-Failed", Reason = "Cell Occupied." })
            return
        end

        -- updates player coordinates while checking for grid boundaries
        Players[playerToMove].x = (newX - 1) % Width + 1
        Players[playerToMove].y = (newY - 1) % Height + 1

        Send({
            Target = playerToMove,
            Action = "Player-Moved",
            Data = playerToMove ..
                " moved to " .. Players[playerToMove].x .. "," .. Players[playerToMove].y .. "."
        })
    else
        Send({ Target = playerToMove, Action = "Move-Failed", Reason = "Invalid direction." })
    end
    print("Moved...")
    print(Players[playerToMove])
    Players[playerToMove].lastTurn = msg.Timestamp
    onTick() -- Optional: Update energy each move
end

-- Handles player attacks
-- @param msg: Message request sent by player with attack info and player state
function attack(msg)
    local player = msg.From
    local attackEnergy = tonumber(msg.Tags.AttackEnergy) < 0 and 0 or tonumber(msg.Tags.AttackEnergy)

    -- get player coordinates
    local x = Players[player].x
    local y = Players[player].y

    -- only 1/4 turn per second
    if msg.Timestamp < Players[player].lastTurn + TURN_TIME then
        return
    end

    -- check if player has enough energy to attack
    if Players[player].energy < attackEnergy then
        ao.send({ Target = player, Action = "Attack-Failed", Reason = "Not enough energy." })
        return
    end

    -- update player energy and calculate damage
    Players[player].energy = Players[player].energy - attackEnergy
    local damage = math.floor((math.random() * 2 * attackEnergy) * (1 / AverageMaxStrengthHitsToKill))

    for target, state in pairs(Players) do
        if target ~= player and inRange(x, y, state.x, state.y, Range) then
            local newHealth = state.health - damage
            -- Document Current Attacks
            CurrentAttacks = CurrentAttacks + 1
            LastPlayerAttacks[CurrentAttacks] = {
                Player = player,
                Target = target,
                id = CurrentAttacks
            }
            if newHealth <= 0 then
                eliminatePlayer(target, player)
            else
                Players[target].health = newHealth
                Send({ Target = target, Action = "Hit", Damage = tostring(damage), Health = tostring(newHealth) })
                Send({
                    Target = player,
                    Action = "Successful-Hit",
                    Recipient = target,
                    Damage = tostring(damage),
                    Health =
                        tostring(newHealth)
                })
            end
        end
    end
    print("attacked...")
    print(Players[player])
    Players[player].lastTurn = msg.Timestamp
end

-- Helper function to check if a target is within range
-- @param x1, y1: Coordinates of the attacker
-- @param x2, y2: Coordinates of the potential target
-- @param range: Attack range
-- @return Boolean indicating if the target is within range
function inRange(x1, y1, x2, y2, range)
    return x2 >= (x1 - range) and x2 <= (x1 + range) and y2 >= (y1 - range) and y2 <= (y1 + range)
end

-- HANDLERS: Game state management for AO-Effect

-- Handler for player movement
Handlers.add("PlayerMove", Handlers.utils.hasMatchingTag("Action", "PlayerMove"), move)

-- Handler for player attacks
Handlers.add("PlayerAttack", Handlers.utils.hasMatchingTag("Action", "PlayerAttack"), attack)



-- HANDLERS: Game state management

-- Handler for cron messages, manages game state transitions.
Handlers.add(
    "Game-State-Timers",
    function(Msg)
        return "continue"
    end,
    function(Msg)
        Now = tonumber(Msg.Timestamp)
        onTick()
    end
)

-- Handler for player deposits to participate in the next game.
Handlers.add(
    "Transfer",
    function(Msg)
        return
            Msg.Action == "Credit-Notice" and
            Msg.From == CRED and
            tonumber(Msg.Quantity) >= PaymentQty and "continue"
    end,
    function(Msg)
        if #Utils.keys(Players) == 35 then
            Send({
                Target = CRED,
                Action = "Transfer",
                Quantity = Msg.Quantity,
                Recipient = Msg.Sender,
                ["X-Reason"] =
                "Game Maxed Out"
            })
            return "ok"
        end

        local q = tonumber(Msg.Quantity)

        if not Balances[Msg.Sender] then
            Balances[Msg.Sender] = "0"
        end

        local balance = tonumber(Balances[Msg.Sender])
        Players[Msg.Sender] = playerInitState()

        balance = math.floor(balance + q)
        Balances[Msg.Sender] = tostring(balance)
        if balance <= 10 then
            Players[Msg.Sender].health = 1
        elseif balance >= 1000 then
            Players[Msg.Sender].health = 100
        else
            Players[Msg.Sender].health = math.floor(scaleNumber(balance))
        end
        Send({
            Target = Msg.Sender,
            Action = "Payment-Received",
            Data = "You are in the game."
        })
    end
)

-- Exits the game receives CRED
Handlers.add(
    "Withdraw",
    Handlers.utils.hasMatchingTag("Action", "Withdraw"),
    function(Msg)
        Players[Msg.From] = nil
        Send({ Target = CRED, Action = "Transfer", Quantity = Balances[Msg.From], Recipient = Msg.From })
        Balances[Msg.From] = "0"
        Send({
            Target = Msg.From,
            Action = "Removed",
            Data = "Removed from Grid"
        })
    end
)


-- Retrieves the current game state.
Handlers.add(
    "GetGameState",
    Handlers.utils.hasMatchingTag("Action", "GetGameState"),
    function(Msg)
        if Players[Msg.From] and Msg.Name then
            Players[Msg.From].name = Msg.Name
        end
        local json = require("json")
        local GameState = json.encode({
            GameMode = GameMode,
            Players = Players,
        })
        Send({
            Target = Msg.From,
            Action = "GameState",
            Data = GameState
        })
    end
)

-- Retrieves the current attacks that has been made in the game.
Handlers.add(
    "GetGameAttacksInfo",
    Handlers.utils.hasMatchingTag("Action", "GetGameAttacksInfo"),
    function(Msg)
        local GameAttacksInfo = require("json").encode({
            LastPlayerAttacks = Utils.values(LastPlayerAttacks)
        })
        Send({
            Target = Msg.From,
            Action = "GameAttacksInfo",
            Data = GameAttacksInfo
        })
    end
)
