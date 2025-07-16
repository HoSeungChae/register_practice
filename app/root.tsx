import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
  useLocation,
} from "@remix-run/react";
import { useEffect } from "react";
import appStylesHref from "./app.css?url";
import { createEmptyContact, getContacts } from "./data";
import { redirect } from "@remix-run/node";

function isLoginPath(url: string): boolean {
  const path = new URL(url).pathname;
  return path === "/login";
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (isLoginPath(request.url)) return null;

  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts, q };
};

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const navigation = useNavigation();
  const submit = useSubmit();

  const data = useLoaderData<typeof loader>();

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement && data?.q) {
      searchField.value = data.q;
    }
  }, [data]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {isLoginPage ? (
          // ✅ 로그인 페이지는 content만 Outlet으로 표시
          <Outlet />
        ) : (
          // ✅ 그 외 페이지는 원래 레이아웃 유지
          <>
            <div id="sidebar">
              <h1>Remix Contacts</h1>
              <div>
                <Form method="post">
                  <button type="submit">New</button>
                </Form>
                <Form
                  id="search-form"
                  role="search"
                  onChange={(event) => {
                    const isFirstSearch = data?.q == null;
                    submit(event.currentTarget, {
                      replace: !isFirstSearch,
                    });
                  }}
                >
                  <input
                    aria-label="Search contacts"
                    className={searching ? "loading" : ""}
                    defaultValue={data?.q || ""}
                    id="q"
                    name="q"
                    placeholder="Search"
                    type="search"
                  />
                  <div id="search-spinner" aria-hidden hidden={!searching} />
                </Form>
              </div>
              <nav>
                {data?.contacts?.length ? (
                  <ul>
                    {data.contacts.map((contact) => (
                      <li key={contact.id}>
                        <NavLink
                          to={`contacts/${contact.id}`}
                          className={({ isActive, isPending }) =>
                            isActive
                              ? "active"
                              : isPending
                              ? "pending"
                              : ""
                          }
                        >
                          {contact.first || contact.last ? (
                            <>
                              {contact.first} {contact.last}
                            </>
                          ) : (
                            <i>No Name</i>
                          )}
                          {contact.favorite && <span>★</span>}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    <i>No contacts</i>
                  </p>
                )}
              </nav>
            </div>
            <div
              id="detail"
              className={
                navigation.state === "loading" && !searching ? "loading" : ""
              }
            >
              <Outlet />
            </div>
          </>
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
