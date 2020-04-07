import json
import itertools

pr = lambda d: json.dumps(d, indent=4, sort_keys=True)
pp = lambda d: print(pr(d))

j = '[ { "user": { "id": "uBeHrEaJCMzNsd_xAAAH", "username": "13", "room": "12", "role": null }, "msg": "dsgs" }, { "user": { "id": "uBeHrEaJCMzNsd_xAAAH", "username": "123", "room": "132", "role": null }, "msg": "dsg" }, { "user": { "id": "uBeHrEaJCMzNsd_xAAAH", "username": "123", "room": "132", "role": null }, "msg": ".dsf" }, { "user": { "id": "uBeHrEaJCMzNsd_xAAAH", "username": "123", "room": "132", "role": null }, "msg": "ds" }, { "user": { "id": "uBeHrEaJCMzNsd_xAAAH", "username": "123", "room": "132", "role": null }, "msg": "f" }, { "user": { "id": "aL9b36AYFIwdOUJcAAAJ", "username": "fdshdf", "room": "132", "role": null }, "msg": "dfhhdfs" }, { "user": { "id": "aL9b36AYFIwdOUJcAAAJ", "username": "fdshdf", "room": "132", "role": null }, "msg": "dfshfd" }, { "user": { "id": "uBeHrEaJCMzNsd_xAAAH", "username": "123", "room": "132", "role": null }, "msg": "dfdsg" }, { "user": { "id": "aL9b36AYFIwdOUJcAAAJ", "username": "fdshdf", "room": "132", "role": null }, "msg": "df" }, { "user": { "id": "uBeHrEaJCMzNsd_xAAAH", "username": "123", "room": "132", "role": null }, "msg": "df" }, { "user": { "id": "uBeHrEaJCMzNsd_xAAAH", "username": "123", "room": "132", "role": null }, "msg": "df" }, { "user": { "id": "uBeHrEaJCMzNsd_xAAAH", "username": "123", "room": "132", "role": null }, "msg": "fd" }, { "user": { "id": "aL9b36AYFIwdOUJcAAAJ", "username": "fdshdf", "room": "132", "role": null }, "msg": "?" } ]'
parsed = json.loads(j)

"""
# The following code adds room_id to the data, so program outputs error
# with those line commented out.

for idx, obj in enumerate(parsed):
    obj["user"]["room_id"] = hash(obj["user"]["room"])
    obj["user"]["role"] = ["role1", "role2", "role3"][idx % 3]
"""

data = sorted(parsed, key=lambda obj: obj["user"]["room_id"])

# pp(data)

all_roles = set([obj["user"]["role"] for obj in parsed])

handlers = {role: open("convoHistory_" + str(role) + ".txt", "w") for role in all_roles}
convos = {
    room_id: list(cs)
    for room_id, cs in itertools.groupby(data, lambda obj: obj["user"]["room_id"])
}

print("\nall roles: \n" + str(all_roles))
print("\nhandlers: \n" + str(handlers))
print("\nconvos: \n" + str(convos))

for room_id, convo in convos.items():
    participants = list(set([message["user"]["role"] for message in convo]))
    print(room_id)
    print(participants)
    for participant in participants:
        handler = handlers[participant]
        participants_copy = list(participants)
        participants_copy.remove(participant)
        handler.write(
            "Conversation with " + ", ".join(list(participants_copy)) + ":\n\n"
        )
        for message in convo:
            handler.write(message["user"]["role"] + ": " + message["msg"] + "\n")
        handler.write("\n")
