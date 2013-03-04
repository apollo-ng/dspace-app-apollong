define([
  'hbs!templates/contextMenu',
  'hbs!templates/featureBoxItem',
  'hbs!templates/featureInfoModal',
  'hbs!templates/userOptionModal',
  'hbs!templates/statusPanel',
  'hbs!templates/overlayManager',
  'hbs!templates/featureDetails',
  'hbs!templates/featureBox',
  'hbs!templates/featureTab'
], function(contextMenu, featureBoxItem, featureInfoModal, userOptionModal, statusPanel, overlayManager, featureDetails, featureBox, featureTab) {

  return {
    contextMenu: contextMenu,
    featureBoxItem: featureBoxItem,
    featureInfoModal: featureInfoModal,
    userOptionModal: userOptionModal,
    statusPanel: statusPanel,
    overlayManager: overlayManager,
    featureDetails: featureDetails,
    featureBox: featureBox,
    featureTab: featureTab
  };

});
