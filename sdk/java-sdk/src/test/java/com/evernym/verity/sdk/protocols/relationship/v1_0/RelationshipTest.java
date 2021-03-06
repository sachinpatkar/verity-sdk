package com.evernym.verity.sdk.protocols.relationship.v1_0;

import com.evernym.verity.sdk.TestHelpers;
import com.evernym.verity.sdk.exceptions.VerityException;
import com.evernym.verity.sdk.protocols.relationship.Relationship;
import com.evernym.verity.sdk.utils.Util;
import org.json.JSONObject;
import org.junit.Test;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import static org.junit.Assert.*;

public class RelationshipTest {

    final String label = "Alice";
    final URL logoUrl = new URL("http://server.com/profile_url.png");
    final String forRelationship = "did1";
    final boolean shortInvite = true;

    public RelationshipTest() throws MalformedURLException {
    }

    @Test
    public void testGetMessageType() {
        RelationshipV1_0 relationshipProvisioning = Relationship.v1_0(
                "forRelationship",
                "threadId"
        );
        String msgName = "msg name";
        assertEquals(
            Util.getMessageType(
                    Util.EVERNYM_MSG_QUALIFIER,
                    "relationship",
                    "1.0",
                    msgName
            ),
            relationshipProvisioning.messageType(msgName)
        );
    }

    @Test
    public void testGetThreadId() {
        RelationshipV1_0 testProtocol = Relationship.v1_0(label);
        assertNotNull(testProtocol.getThreadId());
    }

    @Test
    public void testCreateMsg() throws VerityException, IOException {
        RelationshipV1_0 relationship = Relationship.v1_0(label);
        JSONObject msg = relationship.createMsg(TestHelpers.getContext());
        testCreateMsg(msg, false);

        RelationshipV1_0 relationship2 = Relationship.v1_0(label, logoUrl);
        JSONObject msg2 = relationship2.createMsg(TestHelpers.getContext());
        testCreateMsg(msg2, true);
    }

    private void testCreateMsg(JSONObject msg, boolean hasLogo) {
        testBaseMessage(msg);
        assertEquals("did:sov:123456789abcdefghi1234;spec/relationship/1.0/create", msg.getString("@type"));
        assertEquals(label, msg.getString("label"));
        if (hasLogo)
            assertEquals(logoUrl.toString(), msg.getString("logoUrl"));
        else
            assertFalse(msg.has("logoUrl"));
    }

    @Test
    public void testConnectionInvitationMsg() throws VerityException, IOException {
        RelationshipV1_0 relationship = Relationship.v1_0(forRelationship, "thread-id");
        JSONObject msg = relationship.connectionInvitationMsg(TestHelpers.getContext(), null);
        testConnectionInvitationMsg(msg, false);
    }

    @Test
    public void testConnectionInvitationMsgWithShortInvite() throws VerityException, IOException {
        RelationshipV1_0 relationship = Relationship.v1_0(forRelationship, "thread-id");
        JSONObject msg = relationship.connectionInvitationMsg(TestHelpers.getContext(), shortInvite);
        testConnectionInvitationMsg(msg, true);
    }

    private void testConnectionInvitationMsg(JSONObject msg, boolean hasShortInvite) {
        testBaseMessage(msg);
        assertEquals("did:sov:123456789abcdefghi1234;spec/relationship/1.0/connection-invitation", msg.getString("@type"));
        assertNotNull(forRelationship, msg.getString("~for_relationship"));
        if (hasShortInvite)
            assertEquals(shortInvite, msg.getBoolean("shortInvite"));
    }

    @Test
    public void testOutOfBandIInvitationMsg() throws VerityException, IOException {
        RelationshipV1_0 relationship = Relationship.v1_0(forRelationship, "thread-id");
        JSONObject msg = relationship.outOfBandInvitationMsg(TestHelpers.getContext(), null);
        testOutOfBandInvitationMsg(msg, false);
    }

    @Test
    public void testOutOfBandIInvitationMsgWithShortInvite() throws VerityException, IOException {
        RelationshipV1_0 relationship = Relationship.v1_0(forRelationship, "thread-id");
        JSONObject msg = relationship.outOfBandInvitationMsg(TestHelpers.getContext(), shortInvite);
        testOutOfBandInvitationMsg(msg, true);
    }

    @Test
    public void testOutOfBandIInvitationMsgWithGoalCode() throws VerityException, IOException {
        RelationshipV1_0 relationship = Relationship.v1_0(forRelationship, "thread-id");
        JSONObject msg = relationship.outOfBandInvitationMsg(
                TestHelpers.getContext(),
                null,
                GoalCode.REQUEST_PROOF
        );
//        testOutOfBandInvitationMsg(msg, false);
        assert(msg.getString("goalCode").equals(GoalCode.REQUEST_PROOF.code()));
        assert(msg.getString("goal").equals(GoalCode.REQUEST_PROOF.goalName()));
    }

    private void testOutOfBandInvitationMsg(JSONObject msg, boolean hasShortInvite) {
        testBaseMessage(msg);
        assertEquals("did:sov:123456789abcdefghi1234;spec/relationship/1.0/out-of-band-invitation", msg.getString("@type"));
        assert(msg.getString("goalCode").equals(GoalCode.P2P_MESSAGING.code()));
        assert(msg.getString("goal").equals(GoalCode.P2P_MESSAGING.goalName()));
        if (hasShortInvite)
            assertEquals(shortInvite, msg.getBoolean("shortInvite"));
    }

    private void testBaseMessage(JSONObject msg) {
        assertNotNull(msg.getString("@type"));
        assertNotNull(msg.getString("@id"));
        assertNotNull(msg.getJSONObject("~thread").getString("thid"));
    }
}