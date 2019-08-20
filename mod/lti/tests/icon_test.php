<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Unit tests for functions to support icons.
 *
 * @package   mod_lti
 * @copyright 2019 Davo Smith, Synergy Learning
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Unit tests for functions to support icons.
 *
 * @package mod_lti
 * @copyright 2019 Davo Smith, Synergy Learning
 */
class mod_lti_icon_testcase extends advanced_testcase {
    const ICONFILE = '/pix/moodlelogo.png';

    public function setUp() {
        $this->resetAfterTest();
    }

    private function configure_tool($uploadicon = true, $seticonurl = true) {
        global $CFG;
        require_once($CFG->dirroot.'/mod/lti/lib.php');
        require_once($CFG->dirroot.'/mod/lti/locallib.php');
        $tool = (object)[
            'state' => LTI_TOOL_STATE_CONFIGURED,
            'name' => 'Test tool',
            'description' => 'Example description',
            'baseurl' => 'http://www.example.com',
        ];
        $toolconfig = [
            'lti_toolurl' => 'http://www.example.com',
            'lti_icon' => 'http://www.example.com/toolicon',
            'lti_secureicon' => 'https://www.example.com/toolicon',
        ];
        if (!$seticonurl) {
            unset($toolconfig['lti_icon'], $toolconfig['lti_secureicon']);
        }
        $tool->id = lti_add_type($tool, (object)$toolconfig);
        $toolconfig = lti_get_type_config($tool->id);

        if ($uploadicon) {
            $iconpath = $CFG->dirroot.self::ICONFILE;
            $fs = get_file_storage();
            $fs->create_file_from_pathname([
                'contextid' => context_system::instance()->id,
                'component' => 'mod_lti',
                'filearea' => 'icon',
                'itemid' => $tool->id,
                'filepath' => '/',
                'filename' => 'toolicon.png',
            ], $iconpath);
        }

        return [$tool, $toolconfig];
    }

    private function create_instance($tool, $uploadicon = true, $seticonurl = true) {
        global $CFG;
        $gen = self::getDataGenerator();
        /** @var mod_lti_generator $ltigen */
        $ltigen = $gen->get_plugin_generator('mod_lti');
        $course = $gen->create_course();
        $ltidata = [
            'course' => $course->id,
            'typeid' => $tool->id,
            'icon' => 'http://www.example.com/instanceicon',
            'secureicon' => 'https://www.example.com/instanceicon',
        ];
        if (!$seticonurl) {
            unset($ltidata['icon'], $ltidata['secureicon']);
        }
        $lti = $ltigen->create_instance($ltidata);
        $modinfo = get_fast_modinfo($course);
        $cm = $modinfo->get_cm($lti->cmid);

        if ($uploadicon) {
            $iconpath = $CFG->dirroot.self::ICONFILE;
            $fs = get_file_storage();
            $fs->create_file_from_pathname([
                'contextid' => context_module::instance($cm->id)->id,
                'component' => 'mod_lti',
                'filearea' => 'icon',
                'itemid' => LTI_ICON_ITEMID,
                'filepath' => '/',
                'filename' => 'instanceicon.png',
            ], $iconpath);
        }

        return [$cm, $lti];
    }

    public function test_get_icon_no_icon() {
        list($tool, $toolconfig) = $this->configure_tool(false, false);
        $icon = lti_get_custom_icon_url(null, null, $tool, $toolconfig);
        $this->assertNull($icon);
        $description = lti_get_icon_source_description(null, null, $tool, $toolconfig);
        $this->assertContains('default external tool icon', $description);
    }

    public function test_get_icon_tool_icon_url() {
        list($tool, $toolconfig) = $this->configure_tool(false);
        $icon = lti_get_custom_icon_url(null, null, $tool, $toolconfig);
        $this->assertContains('www.example.com/toolicon', $icon->out());
        $description = lti_get_icon_source_description(null, null, $tool, $toolconfig);
        $this->assertContains('icon URL specified in the Test tool external tool configuration', $description);
    }

    public function test_get_icon_tool_upload_icon() {
        list($tool, $toolconfig) = $this->configure_tool();
        $icon = lti_get_custom_icon_url(null, null, $tool, $toolconfig);
        $this->assertContains('toolicon.png', $icon->out());
        $description = lti_get_icon_source_description(null, null, $tool, $toolconfig);
        $this->assertContains('uploaded icon in the Test tool external tool configuration', $description);
    }

    public function test_get_icon_instance_no_icon() {
        list($tool, $toolconfig) = $this->configure_tool();
        list($cm, $lti) = $this->create_instance($tool, false, false);
        $icon = lti_get_custom_icon_url($cm, $lti, $tool, $toolconfig);
        $this->assertContains('toolicon.png', $icon->out());
        $description = lti_get_icon_source_description($cm, $lti, $tool, $toolconfig);
        $this->assertContains('uploaded icon in the Test tool external tool configuration', $description);
    }

    public function test_get_icon_instance_icon_url() {
        list($tool, $toolconfig) = $this->configure_tool();
        list($cm, $lti) = $this->create_instance($tool, false);
        $icon = lti_get_custom_icon_url($cm, $lti, $tool, $toolconfig);
        $this->assertContains('www.example.com/instanceicon', $icon->out());
        $description = lti_get_icon_source_description($cm, $lti, $tool, $toolconfig);
        $this->assertContains('icon URL specified in the activity settings', $description);
    }

    public function test_get_icon_instance_upload_icon() {
        list($tool, $toolconfig) = $this->configure_tool();
        list($cm, $lti) = $this->create_instance($tool);
        $icon = lti_get_custom_icon_url($cm, $lti, $tool, $toolconfig);
        $this->assertContains('instanceicon.png', $icon->out());
        $description = lti_get_icon_source_description($cm, $lti, $tool, $toolconfig);
        $this->assertContains('uploaded icon in the activity settings', $description);
    }

    public function test_delete_activity_icon() {
        list($tool, $toolconfig) = $this->configure_tool();
        list($cm, $lti) = $this->create_instance($tool, true, false);
        lti_delete_activity_icon(context_module::instance($cm->id));
        $icon = lti_get_custom_icon_url($cm, $lti, $tool, $toolconfig);
        $this->assertContains('toolicon.png', $icon->out());
        $description = lti_get_icon_source_description($cm, $lti, $tool, $toolconfig);
        $this->assertContains('uploaded icon in the Test tool external tool configuration', $description);
    }

    public function test_delete_tooltype_icon() {
        list($tool, $toolconfig) = $this->configure_tool();
        lti_delete_tooltype_icon($tool->id);
        $icon = lti_get_custom_icon_url(null, null, $tool, $toolconfig);
        $this->assertContains('www.example.com/toolicon', $icon->out());
        $description = lti_get_icon_source_description(null, null, $tool, $toolconfig);
        $this->assertContains('icon URL specified in the Test tool external tool configuration', $description);

    }
}
