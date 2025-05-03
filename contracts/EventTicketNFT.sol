// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title EventTicketNFT
 * @dev A contract for creating and managing event tickets as NFTs with anti-scalping measures
 */
contract EventTicketNFT is ERC721URIStorage, Ownable, ERC721Burnable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _eventIdCounter;

    // Event organizer registration
    mapping(address => bool) public registeredOrganizers;
    mapping(address => string) public organizerDetails; // Name, contact info, etc.

    // Event struct to store event details
    struct Event {
        string name;
        string description;
        uint256 date;
        uint256 ticketPrice;
        uint256 totalTickets;
        uint256 ticketsSold;
        address organizer;
        string ipfsImageHash;
        bool isActive;
        uint256 maxTicketsPerBuyer; // Anti-scalping: limit tickets per buyer
        bool transferLocked; // Anti-scalping: prevent transfers after purchase
    }

    // Ticket struct to store ticket details
    struct Ticket {
        uint256 eventId;
        uint256 ticketNumber;
        address originalBuyer;
        bool isUsed;
        uint256 purchasePrice;
        uint256 purchaseDate;
    }

    // Mapping from event ID to event details
    mapping(uint256 => Event) public events;

    // Mapping from token ID to ticket details
    mapping(uint256 => Ticket) public tickets;

    // Mapping from event ID to token IDs for that event
    mapping(uint256 => uint256[]) public eventTickets;

    // Mapping from address to number of tickets owned per event
    mapping(address => mapping(uint256 => uint256)) public ticketsOwnedPerEvent;

    // Events
    event OrganizerRegistered(address indexed organizer, string details);
    event EventCreated(uint256 indexed eventId, string name, uint256 date, uint256 ticketPrice, uint256 totalTickets);
    event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed buyer);
    event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId);
    event EventCancelled(uint256 indexed eventId);

    constructor() ERC721("EventTicketNFT", "ETNFT") {
        // Initialize with contract deployer as owner
    }

    modifier onlyOrganizer() {
        require(registeredOrganizers[msg.sender], "Not a registered organizer");
        _;
    }

    modifier onlyEventOrganizer(uint256 _eventId) {
        require(events[_eventId].organizer == msg.sender, "Not the event organizer");
        _;
    }

    /**
     * @dev Register a new event organizer
     * @param _organizer Address of the organizer
     * @param _details Organizer details (name, contact info, etc.)
     */
    function registerOrganizer(address _organizer, string memory _details) public onlyOwner {
        registeredOrganizers[_organizer] = true;
        organizerDetails[_organizer] = _details;
        emit OrganizerRegistered(_organizer, _details);
    }

    /**
     * @dev Create a new event
     * @param _name Event name
     * @param _description Event description
     * @param _date Event date (Unix timestamp)
     * @param _ticketPrice Price per ticket in wei
     * @param _totalTickets Total number of tickets available
     * @param _ipfsImageHash IPFS hash of the event image
     * @param _maxTicketsPerBuyer Maximum tickets per buyer (anti-scalping measure)
     * @param _transferLocked Whether tickets can be transferred after purchase
     */
    function createEvent(
        string memory _name,
        string memory _description,
        uint256 _date,
        uint256 _ticketPrice,
        uint256 _totalTickets,
        string memory _ipfsImageHash,
        uint256 _maxTicketsPerBuyer,
        bool _transferLocked
    ) public onlyOrganizer returns (uint256) {
        require(_date > block.timestamp, "Event date must be in the future");
        require(_totalTickets > 0, "Total tickets must be greater than zero");
        require(_maxTicketsPerBuyer > 0, "Max tickets per buyer must be greater than zero");

        uint256 eventId = _eventIdCounter.current();
        _eventIdCounter.increment();

        events[eventId] = Event({
            name: _name,
            description: _description,
            date: _date,
            ticketPrice: _ticketPrice,
            totalTickets: _totalTickets,
            ticketsSold: 0,
            organizer: msg.sender,
            ipfsImageHash: _ipfsImageHash,
            isActive: true,
            maxTicketsPerBuyer: _maxTicketsPerBuyer,
            transferLocked: _transferLocked
        });

        emit EventCreated(eventId, _name, _date, _ticketPrice, _totalTickets);

        return eventId;
    }

    /**
     * @dev Purchase tickets for an event
     * @param _eventId Event ID
     * @param _quantity Number of tickets to purchase
     * @param _tokenURIs Array of token URIs for each ticket
     */
    function purchaseTickets(
        uint256 _eventId,
        uint256 _quantity,
        string[] memory _tokenURIs
    ) public payable returns (uint256[] memory) {
        Event storage eventDetails = events[_eventId];

        require(eventDetails.isActive, "Event is not active");
        require(block.timestamp < eventDetails.date, "Event has already occurred");
        require(eventDetails.ticketsSold + _quantity <= eventDetails.totalTickets, "Not enough tickets available");
        require(msg.value >= eventDetails.ticketPrice * _quantity, "Insufficient payment");
        require(_quantity <= eventDetails.maxTicketsPerBuyer, "Exceeds maximum tickets per buyer");
        require(ticketsOwnedPerEvent[msg.sender][_eventId] + _quantity <= eventDetails.maxTicketsPerBuyer,
                "Exceeds maximum tickets per buyer including previously purchased tickets");
        require(_tokenURIs.length == _quantity, "Token URIs count must match quantity");

        uint256[] memory tokenIds = new uint256[](_quantity);

        for (uint256 i = 0; i < _quantity; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();

            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, _tokenURIs[i]);

            tickets[tokenId] = Ticket({
                eventId: _eventId,
                ticketNumber: eventDetails.ticketsSold + i + 1,
                originalBuyer: msg.sender,
                isUsed: false,
                purchasePrice: eventDetails.ticketPrice,
                purchaseDate: block.timestamp
            });

            eventTickets[_eventId].push(tokenId);
            tokenIds[i] = tokenId;

            emit TicketMinted(tokenId, _eventId, msg.sender);
        }

        eventDetails.ticketsSold += _quantity;
        ticketsOwnedPerEvent[msg.sender][_eventId] += _quantity;

        // Transfer payment to event organizer
        payable(eventDetails.organizer).transfer(msg.value);

        return tokenIds;
    }

    /**
     * @dev Mark a ticket as used
     * @param _tokenId Token ID of the ticket
     */
    function useTicket(uint256 _tokenId) public {
        require(_exists(_tokenId), "Ticket does not exist");
        Ticket storage ticket = tickets[_tokenId];
        uint256 eventId = ticket.eventId;

        require(events[eventId].organizer == msg.sender || owner() == msg.sender,
                "Only the event organizer or contract owner can mark tickets as used");
        require(!ticket.isUsed, "Ticket has already been used");

        ticket.isUsed = true;
        emit TicketUsed(_tokenId, eventId);
    }

    /**
     * @dev Cancel an event and enable refunds
     * @param _eventId Event ID
     */
    function cancelEvent(uint256 _eventId) public onlyEventOrganizer(_eventId) {
        Event storage eventDetails = events[_eventId];
        require(eventDetails.isActive, "Event is already cancelled");
        require(block.timestamp < eventDetails.date, "Event has already occurred");

        eventDetails.isActive = false;
        emit EventCancelled(_eventId);
    }

    /**
     * @dev Get event details
     * @param _eventId Event ID
     */
    function getEventDetails(uint256 _eventId) public view returns (
        string memory name,
        string memory description,
        uint256 date,
        uint256 ticketPrice,
        uint256 totalTickets,
        uint256 ticketsSold,
        address organizer,
        string memory ipfsImageHash,
        bool isActive,
        uint256 maxTicketsPerBuyer,
        bool transferLocked
    ) {
        Event memory eventDetails = events[_eventId];

        return (
            eventDetails.name,
            eventDetails.description,
            eventDetails.date,
            eventDetails.ticketPrice,
            eventDetails.totalTickets,
            eventDetails.ticketsSold,
            eventDetails.organizer,
            eventDetails.ipfsImageHash,
            eventDetails.isActive,
            eventDetails.maxTicketsPerBuyer,
            eventDetails.transferLocked
        );
    }

    /**
     * @dev Get ticket details
     * @param _tokenId Token ID
     */
    function getTicketDetails(uint256 _tokenId) public view returns (
        uint256 eventId,
        uint256 ticketNumber,
        address originalBuyer,
        bool isUsed,
        uint256 purchasePrice,
        uint256 purchaseDate
    ) {
        require(_exists(_tokenId), "Ticket does not exist");
        Ticket memory ticket = tickets[_tokenId];

        return (
            ticket.eventId,
            ticket.ticketNumber,
            ticket.originalBuyer,
            ticket.isUsed,
            ticket.purchasePrice,
            ticket.purchaseDate
        );
    }

    /**
     * @dev Get all tickets for an event
     * @param _eventId Event ID
     */
    function getEventTickets(uint256 _eventId) public view returns (uint256[] memory) {
        return eventTickets[_eventId];
    }

    /**
     * @dev Get organizer details
     * @param _organizer Address of the organizer
     */
    function getOrganizerDetails(address _organizer) public view returns (string memory) {
        require(registeredOrganizers[_organizer], "Not a registered organizer");
        return organizerDetails[_organizer];
    }

    /**
     * @dev Check if an address is a registered organizer
     * @param _organizer Address to check
     */
    function isOrganizerRegistered(address _organizer) public view returns (bool) {
        return registeredOrganizers[_organizer];
    }

    /**
     * @dev Get the total number of events
     */
    function getEventCount() public view returns (uint256) {
        return _eventIdCounter.current();
    }

    /**
     * @dev Override transfer function to implement anti-scalping measures
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override(ERC721) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        // Skip checks for minting (from == address(0)) and burning (to == address(0))
        if (from != address(0) && to != address(0)) {
            Ticket memory ticket = tickets[tokenId];
            Event memory eventDetails = events[ticket.eventId];

            // Check if transfers are locked for this event
            if (eventDetails.transferLocked) {
                require(
                    from == ticket.originalBuyer &&
                    (to == eventDetails.organizer || to == owner()),
                    "Transfers are locked for this event's tickets except to the organizer or contract owner"
                );
            }

            // Check if the event has already occurred
            require(block.timestamp < eventDetails.date, "Cannot transfer tickets after the event");

            // Check if the ticket has been used
            require(!ticket.isUsed, "Cannot transfer used tickets");

            // Update the count of tickets owned per event
            ticketsOwnedPerEvent[from][ticket.eventId]--;
            ticketsOwnedPerEvent[to][ticket.eventId]++;

            // Check if the recipient would exceed the maximum tickets per buyer
            require(
                ticketsOwnedPerEvent[to][ticket.eventId] <= eventDetails.maxTicketsPerBuyer,
                "Transfer would exceed maximum tickets per buyer"
            );
        }
    }

    /**
     * @dev Override supportsInterface function
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override tokenURI function
     */
    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override _burn function
     */
    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        delete tickets[tokenId];
    }
}
