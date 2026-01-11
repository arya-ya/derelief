// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DeRelief
 * @dev Transparent crowdfunding platform on Base
 */
contract DeRelief is Ownable, ReentrancyGuard {
    // Campaign structure
    struct Campaign {
        uint256 id;
        string name;
        string description;
        string category;
        address payable recipient;
        uint256 targetAmount;
        uint256 collectedAmount;
        uint256 deadline;
        bool isActive;
        bool isWithdrawn;
    }

    // Donation structure
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    // State variables
    IERC20 public idrxToken;
    uint256 public campaignCount;
    
    // Mappings
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation[]) public campaignDonations;
    mapping(address => uint256[]) public userDonations;
    
    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        string name,
        address recipient,
        uint256 targetAmount,
        uint256 deadline
    );
    
    event DonationMade(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 timestamp
    );
    
    event FundsWithdrawn(
        uint256 indexed campaignId,
        address recipient,
        uint256 amount
    );
    
    event CampaignStatusChanged(
        uint256 indexed campaignId,
        bool isActive
    );

    constructor(address _idrxToken) Ownable(msg.sender) {
        idrxToken = IERC20(_idrxToken);
    }

    /**
     * @dev Create a new campaign (only owner for MVP)
     */
    function createCampaign(
        string memory _name,
        string memory _description,
        string memory _category,
        address payable _recipient,
        uint256 _targetAmount,
        uint256 _durationDays
    ) external onlyOwner returns (uint256) {
        require(_recipient != address(0), "Invalid recipient");
        require(_targetAmount > 0, "Target must be > 0");
        require(_durationDays > 0, "Duration must be > 0");

        campaignCount++;
        uint256 deadline = block.timestamp + (_durationDays * 1 days);

        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            name: _name,
            description: _description,
            category: _category,
            recipient: _recipient,
            targetAmount: _targetAmount,
            collectedAmount: 0,
            deadline: deadline,
            isActive: true,
            isWithdrawn: false
        });

        emit CampaignCreated(
            campaignCount,
            _name,
            _recipient,
            _targetAmount,
            deadline
        );

        return campaignCount;
    }

    /**
     * @dev Donate IDRX to a campaign
     */
    function donate(uint256 _campaignId, uint256 _amount) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(campaign.id != 0, "Campaign does not exist");
        require(campaign.isActive, "Campaign is not active");
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(_amount > 0, "Amount must be > 0");

        // Transfer IDRX from donor to contract
        require(
            idrxToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        campaign.collectedAmount += _amount;

        // Record donation
        campaignDonations[_campaignId].push(Donation({
            donor: msg.sender,
            amount: _amount,
            timestamp: block.timestamp
        }));

        userDonations[msg.sender].push(_campaignId);

        emit DonationMade(_campaignId, msg.sender, _amount, block.timestamp);
    }

    /**
     * @dev Withdraw funds (only recipient)
     */
    function withdrawFunds(uint256 _campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(campaign.id != 0, "Campaign does not exist");
        require(msg.sender == campaign.recipient, "Only recipient can withdraw");
        require(campaign.collectedAmount > 0, "No funds to withdraw");
        require(!campaign.isWithdrawn, "Already withdrawn");

        uint256 amount = campaign.collectedAmount;
        campaign.isWithdrawn = true;
        campaign.isActive = false;

        require(
            idrxToken.transfer(campaign.recipient, amount),
            "Transfer failed"
        );

        emit FundsWithdrawn(_campaignId, campaign.recipient, amount);
    }

    /**
     * @dev Toggle campaign status (owner only)
     */
    function toggleCampaignStatus(uint256 _campaignId) external onlyOwner {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        
        campaign.isActive = !campaign.isActive;
        emit CampaignStatusChanged(_campaignId, campaign.isActive);
    }

    // View functions
    
    function getCampaign(uint256 _campaignId) external view returns (Campaign memory) {
        return campaigns[_campaignId];
    }

    function getCampaignDonations(uint256 _campaignId) external view returns (Donation[] memory) {
        return campaignDonations[_campaignId];
    }

    function getCampaignProgress(uint256 _campaignId) external view returns (
        uint256 collected,
        uint256 target,
        uint256 percentage
    ) {
        Campaign memory campaign = campaigns[_campaignId];
        collected = campaign.collectedAmount;
        target = campaign.targetAmount;
        percentage = target > 0 ? (collected * 100) / target : 0;
    }

    function getActiveCampaigns() external view returns (Campaign[] memory) {
        uint256 activeCount = 0;
        
        // Count active campaigns
        for (uint256 i = 1; i <= campaignCount; i++) {
            if (campaigns[i].isActive && block.timestamp < campaigns[i].deadline) {
                activeCount++;
            }
        }
        
        // Create array of active campaigns
        Campaign[] memory activeCampaigns = new Campaign[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= campaignCount; i++) {
            if (campaigns[i].isActive && block.timestamp < campaigns[i].deadline) {
                activeCampaigns[index] = campaigns[i];
                index++;
            }
        }
        
        return activeCampaigns;
    }

    function getUserDonationCount(address _user) external view returns (uint256) {
        return userDonations[_user].length;
    }

    function getDonationCount(uint256 _campaignId) external view returns (uint256) {
        return campaignDonations[_campaignId].length;
    }
}
