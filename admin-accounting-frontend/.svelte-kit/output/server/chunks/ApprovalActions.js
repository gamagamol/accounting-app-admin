import { c as create_ssr_component, v as validate_component, e as escape } from "./ssr.js";
import { B as Button } from "./Button.js";
const ApprovalActions = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { disabled = false } = $$props;
  let { onApprove = void 0 } = $$props;
  let { onReject = void 0 } = $$props;
  let { approveLabel = "Approve" } = $$props;
  let { rejectLabel = "Reject" } = $$props;
  let { rejectFirst = false } = $$props;
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  if ($$props.onApprove === void 0 && $$bindings.onApprove && onApprove !== void 0) $$bindings.onApprove(onApprove);
  if ($$props.onReject === void 0 && $$bindings.onReject && onReject !== void 0) $$bindings.onReject(onReject);
  if ($$props.approveLabel === void 0 && $$bindings.approveLabel && approveLabel !== void 0) $$bindings.approveLabel(approveLabel);
  if ($$props.rejectLabel === void 0 && $$bindings.rejectLabel && rejectLabel !== void 0) $$bindings.rejectLabel(rejectLabel);
  if ($$props.rejectFirst === void 0 && $$bindings.rejectFirst && rejectFirst !== void 0) $$bindings.rejectFirst(rejectFirst);
  return `${rejectFirst && onReject ? `${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "danger", disabled }, {}, {
    default: () => {
      return `${escape(rejectLabel)}`;
    }
  })}` : ``} ${onApprove ? `${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "success", disabled }, {}, {
    default: () => {
      return `${escape(approveLabel)}`;
    }
  })}` : ``} ${!rejectFirst && onReject ? `${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "danger", disabled }, {}, {
    default: () => {
      return `${escape(rejectLabel)}`;
    }
  })}` : ``}`;
});
export {
  ApprovalActions as A
};
