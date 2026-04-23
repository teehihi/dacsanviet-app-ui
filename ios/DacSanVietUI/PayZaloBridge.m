#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(PayZaloBridge, RCTEventEmitter)

RCT_EXTERN_METHOD(payOrder:(NSString *)zpTransToken)
RCT_EXTERN_METHOD(supportedEvents)

@end
