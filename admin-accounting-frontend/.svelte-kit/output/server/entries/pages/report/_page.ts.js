import { redirect } from "@sveltejs/kit";
function load() {
  throw redirect(307, "/reports/aging-schedule");
}
export {
  load
};
